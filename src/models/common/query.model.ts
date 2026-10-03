export interface IQueryEntry<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  updatedAt: number;
}

export interface IQueryState<T> extends IQueryEntry<T> {
  isInitialLoading: boolean;
  isRefreshing: boolean;
  refetch: () => void;
}

export type IQuerySpec<T = unknown> = readonly [
  key: string,
  fetcher: () => Promise<T>,
];

export interface IQueryOptions {
  enabled?: boolean;
  keepPrevious?: boolean;
  ignoreOfflineStatus?: boolean;
}

export interface IMutationOptions<TResult> {
  invalidate?: string[];
  successMessage?: string;
  queuedMessage?: string;
  onSuccess?: (result: TResult) => void | Promise<void>;
}

export interface IMutationResult {
  queued: boolean;
}
