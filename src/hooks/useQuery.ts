import { useEffect } from 'react'
import { useQueryStore, selectEntry, type QueryEntry } from '../stores/query.store'

/**
 * Fetch-on-mount hook backed by the Zustand query cache (no React Query, no
 * useState). Re-runs whenever `key` changes. The cached data is retained on
 * error so the last-loaded view stays visible offline (build spec §2).
 */
export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { enabled?: boolean } = {},
): QueryEntry<T> & { refetch: () => void } {
  const enabled = options.enabled ?? true
  const run = useQueryStore((s) => s.run)
  const entry = useQueryStore(selectEntry<T>(key))

  useEffect(() => {
    if (enabled) void run(key, fetcher)
    // fetcher is intentionally excluded — callers pass an inline closure; `key`
    // is the identity of the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { ...entry, refetch: () => void run(key, fetcher) }
}
