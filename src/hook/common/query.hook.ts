import { useEffect } from "react";
import type {
  IQueryEntry,
  IQueryOptions,
} from "../../models/common/query.model";
import {
  selectEntry,
  useQueryStore,
} from "../../store/common/query.store";

export const useQuery = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: IQueryOptions = {}
): IQueryEntry<T> & { refetch: () => void } => {
  const enabled = options.enabled ?? true;
  const run = useQueryStore((state) => state.run);
  const entry = useQueryStore(selectEntry<T>(key));

  useEffect(() => {
    if (enabled) void run(key, fetcher);
  }, [key, enabled]);

  return { ...entry, refetch: () => void run(key, fetcher) };
};

export const useInvalidate = () =>
  useQueryStore((state) => state.invalidate);
