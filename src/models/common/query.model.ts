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

export type IQueryReader = (key: string) => unknown;

export type IOfflineDerive<T> = (read: IQueryReader) => T | undefined;

export interface IQueryFetcher<T> {
  (): Promise<T>;
  offline?: IOfflineDerive<T>;
}

export type IQuerySpec<T = unknown> = readonly [
  key: string,
  fetcher: IQueryFetcher<T>,
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
