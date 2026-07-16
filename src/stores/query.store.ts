import { create } from 'zustand'

/**
 * A minimal async-cache store. The locked stack has no React Query, and the
 * hard rules forbid `useState`, so all fetch state (data/loading/error) lives
 * here, keyed by a string. `useQuery`/`useMutation` are thin hooks over it.
 */
export interface QueryEntry<T = unknown> {
  data: T | undefined
  loading: boolean
  error: string | null
  /** Bumps on every successful load so consumers can react to fresh data. */
  updatedAt: number
}

interface QueryState {
  entries: Record<string, QueryEntry>
  run: <T>(key: string, fetcher: () => Promise<T>) => Promise<T | undefined>
  /** Merge a partial into an entry — used by useMutation to track loading/error. */
  setEntry: (key: string, partial: Partial<QueryEntry>) => void
  invalidate: (keyPrefix: string) => void
  reset: () => void
}

const EMPTY: QueryEntry = { data: undefined, loading: false, error: null, updatedAt: 0 }

/**
 * The last fetcher seen for each key, so `invalidate` can actually re-fetch.
 * Kept outside the store: functions are not render-relevant state, and putting
 * them in `entries` would churn every subscriber on each run.
 */
const fetchers = new Map<string, () => Promise<unknown>>()

export const useQueryStore = create<QueryState>((set, get) => ({
  entries: {},

  run: async (key, fetcher) => {
    fetchers.set(key, fetcher as () => Promise<unknown>)
    const prev = get().entries[key] ?? EMPTY
    set((s) => ({ entries: { ...s.entries, [key]: { ...prev, loading: true, error: null } } }))
    try {
      const data = await fetcher()
      set((s) => ({
        entries: { ...s.entries, [key]: { data, loading: false, error: null, updatedAt: Date.now() } },
      }))
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      // Keep the last-known data (read-only offline) while surfacing the error.
      set((s) => ({
        entries: { ...s.entries, [key]: { ...(s.entries[key] ?? EMPTY), loading: false, error: message } },
      }))
      return undefined
    }
  },

  setEntry: (key, partial) =>
    set((s) => ({
      entries: { ...s.entries, [key]: { ...(s.entries[key] ?? EMPTY), ...partial } },
    })),

  invalidate: (keyPrefix) => {
    const matches = Object.keys(get().entries).filter(
      (k) => k === keyPrefix || k.startsWith(`${keyPrefix}:`),
    )
    for (const k of matches) {
      const fetcher = fetchers.get(k)
      // Re-run rather than drop the entry: `useQuery` only fetches when its key
      // changes, so a deleted entry would leave the view empty until remount.
      // `run` keeps the previous data visible while the refetch is in flight.
      if (fetcher) void get().run(k, fetcher)
      else
        set((s) => {
          const entries = { ...s.entries }
          delete entries[k]
          return { entries }
        })
    }
  },

  reset: () => {
    fetchers.clear()
    set({ entries: {} })
  },
}))

export const selectEntry =
  <T>(key: string) =>
  (s: QueryState): QueryEntry<T> =>
    (s.entries[key] as QueryEntry<T> | undefined) ?? (EMPTY as QueryEntry<T>)
