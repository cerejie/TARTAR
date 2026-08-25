export interface IQueryEntry<T = unknown> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  updatedAt: number;
}

export interface IQueryOptions {
  enabled?: boolean;
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
