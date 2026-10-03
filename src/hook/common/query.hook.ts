import { useEffect, useRef } from "react";
import type {
  IQueryOptions,
  IQueryState,
} from "../../models/common/query.model";
import {
  selectEntry,
  useQueryStore,
} from "../../store/common/query.store";

export const useQuery = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: IQueryOptions = {}
): IQueryState<T> => {
  const enabled = options.enabled ?? true;
  const countsTowardStatus = !options.ignoreOfflineStatus;
  const run = useQueryStore((state) => state.run);
  const refresh = useQueryStore((state) => state.refresh);
  const watch = useQueryStore((state) => state.watch);
  const unwatch = useQueryStore((state) => state.unwatch);
  const entry = useQueryStore(selectEntry<T>(key));
  const previousData = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    watch(key, countsTowardStatus);
    void run(key, fetcher);
    return () => unwatch(key, countsTowardStatus);
  }, [key, enabled, countsTowardStatus]);

  useEffect(() => {
    if (entry.data !== undefined) previousData.current = entry.data;
  }, [entry.data]);

  const placeholder =
    options.keepPrevious && entry.data === undefined && entry.error === null
      ? previousData.current
      : undefined;
  const data = entry.data ?? placeholder;
  const hasData = data !== undefined;

  return {
    ...entry,
    data,
    isInitialLoading: enabled && !hasData && entry.error === null,
    isRefreshing: hasData && (entry.loading || placeholder !== undefined),
    refetch: () => void refresh(key, fetcher),
  };
};

export const useInvalidate = () =>
  useQueryStore((state) => state.invalidate);
