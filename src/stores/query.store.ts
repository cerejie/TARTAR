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

export const useQueryStore = create<QueryState>((set, get) => ({
  entries: {},

  run: async (key, fetcher) => {
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

  invalidate: (keyPrefix) =>
    set((s) => {
      const entries = { ...s.entries }
      for (const k of Object.keys(entries)) {
        if (k === keyPrefix || k.startsWith(`${keyPrefix}:`)) delete entries[k]
      }
      return { entries }
    }),

  reset: () => set({ entries: {} }),
}))

export const selectEntry =
  <T>(key: string) =>
  (s: QueryState): QueryEntry<T> =>
    (s.entries[key] as QueryEntry<T> | undefined) ?? (EMPTY as QueryEntry<T>)
