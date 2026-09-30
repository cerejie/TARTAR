import { useEffect } from "react";
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
  const run = useQueryStore((state) => state.run);
  const watch = useQueryStore((state) => state.watch);
  const unwatch = useQueryStore((state) => state.unwatch);
  const entry = useQueryStore(selectEntry<T>(key));

  useEffect(() => {
    if (!enabled) return;

    watch(key);
    void run(key, fetcher);
    return () => unwatch(key);
  }, [key, enabled]);

  const hasData = entry.data !== undefined;

  return {
    ...entry,
    isInitialLoading: enabled && !hasData && entry.error === null,
    isRefreshing: entry.loading && hasData,
    refetch: () => void run(key, fetcher),
  };
};

export const useInvalidate = () =>
  useQueryStore((state) => state.invalidate);
