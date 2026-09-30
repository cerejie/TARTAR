import { create } from "zustand";
import { clearQueries, putQuery, readAllQueries } from "../../utils/idb.utils";
import { failureKindOf } from "../../utils/write.utils";
import type { IQueryEntry } from "../../models/common/query.model";

type ICachedQuery = Pick<IQueryEntry, "data" | "updatedAt">;

type States = {
  entries: Record<string, IQueryEntry>;
  watchers: Record<string, number>;
};

type Actions = {
  run: <T>(key: string, fetcher: () => Promise<T>) => Promise<T | undefined>;
  prime: (queries: ReadonlyArray<[string, () => Promise<unknown>]>) => void;
  setEntry: (key: string, partial: Partial<IQueryEntry>) => void;
  watch: (key: string) => void;
  unwatch: (key: string) => void;
  invalidate: (keyPrefix: string) => void;
  refetchAll: () => void;
  reset: () => void;
};

const notSavedOfflineMessage =
  "Not saved for offline. Connect to the internet once to load this page.";

const networkFailurePrefix = "TypeError";

const emptyEntry: IQueryEntry = {
  data: undefined,
  loading: false,
  error: null,
  updatedAt: 0,
};

const initialValues: States = {
  entries: {},
  watchers: {},
};

const fetchers = new Map<string, () => Promise<unknown>>();

const ignoreCacheFailure = () => undefined;

const isNetworkFailure = (error: unknown, message: string): boolean =>
  failureKindOf(error) === "network" ||
  message.startsWith(networkFailurePrefix);

const hydrate = (
  entries: Record<string, IQueryEntry>,
  cached: Record<string, ICachedQuery>
): Record<string, IQueryEntry> => {
  const restored = Object.entries(cached)
    .filter(([key]) => entries[key]?.data === undefined)
    .map(([key, value]) => [
      key,
      { ...emptyEntry, ...entries[key], ...value },
    ]);
  return { ...entries, ...Object.fromEntries(restored) };
};

export const useQueryStore = create<States & Actions>((set, get) => ({
  ...initialValues,

  run: async <T>(key: string, fetcher: () => Promise<T>) => {
    fetchers.set(key, fetcher as () => Promise<unknown>);
    await cacheReady;
    const previous = get().entries[key] ?? emptyEntry;

    if (!navigator.onLine) {
      set((state) => ({
        entries: {
          ...state.entries,
          [key]: {
            ...previous,
            loading: false,
            error: previous.data === undefined ? notSavedOfflineMessage : null,
          },
        },
      }));
      return previous.data as T | undefined;
    }

    set((state) => ({
      entries: {
        ...state.entries,
        [key]: { ...previous, loading: true, error: null },
      },
    }));

    try {
      const data = await fetcher();
      const updatedAt = Date.now();
      set((state) => ({
        entries: {
          ...state.entries,
          [key]: { data, loading: false, error: null, updatedAt },
        },
      }));
      void putQuery<ICachedQuery>(key, { data, updatedAt }).catch(
        ignoreCacheFailure
      );
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      set((state) => {
        const current = state.entries[key] ?? emptyEntry;
        const keepsCachedData =
          current.data !== undefined && isNetworkFailure(error, message);

        return {
          entries: {
            ...state.entries,
            [key]: {
              ...current,
              loading: false,
              error: keepsCachedData ? null : message,
            },
          },
        };
      });
      return undefined;
    }
  },

  prime: (queries) => {
    for (const [key, fetcher] of queries) {
      if (!fetchers.has(key)) void get().run(key, fetcher);
    }
  },

  setEntry: (key, partial) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: { ...(state.entries[key] ?? emptyEntry), ...partial },
      },
    })),

  watch: (key) =>
    set((state) => ({
      watchers: { ...state.watchers, [key]: (state.watchers[key] ?? 0) + 1 },
    })),

  unwatch: (key) =>
    set((state) => ({
      watchers: { ...state.watchers, [key]: (state.watchers[key] ?? 1) - 1 },
    })),

  invalidate: (keyPrefix) => {
    const matches = Object.keys(get().entries).filter(
      (key) => key === keyPrefix || key.startsWith(`${keyPrefix}:`)
    );

    for (const key of matches) {
      const fetcher = fetchers.get(key);

      if (fetcher) {
        void get().run(key, fetcher);
        continue;
      }

      set((state) => {
        const entries = { ...state.entries };
        delete entries[key];
        return { entries };
      });
    }
  },

  refetchAll: () => {
    for (const [key, fetcher] of fetchers) void get().run(key, fetcher);
  },

  reset: () => {
    fetchers.clear();
    set({ entries: {} });
    void clearQueries().catch(ignoreCacheFailure);
  },
}));

const cacheReady: Promise<void> = readAllQueries<ICachedQuery>()
  .then((cached) =>
    useQueryStore.setState((state) => ({
      entries: hydrate(state.entries, cached),
    }))
  )
  .catch(ignoreCacheFailure);

export const selectEntry =
  <T>(key: string) =>
  (state: States): IQueryEntry<T> =>
    (state.entries[key] as IQueryEntry<T> | undefined) ??
    (emptyEntry as IQueryEntry<T>);

const watchedEntriesOf = (state: States): IQueryEntry[] =>
  Object.entries(state.watchers)
    .filter(([, count]) => count > 0)
    .map(([key]) => state.entries[key] ?? emptyEntry);

export const selectOfflineSavedAt = (state: States): number => {
  const savedTimes = watchedEntriesOf(state)
    .map((entry) => entry.updatedAt)
    .filter((updatedAt) => updatedAt > 0);

  return savedTimes.length > 0 ? Math.min(...savedTimes) : 0;
};

export const selectHasUnsavedWatched = (state: States): boolean =>
  watchedEntriesOf(state).some((entry) => entry.data === undefined);
