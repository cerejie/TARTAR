import { create } from "zustand";
import {
  clearQueries,
  deleteQueries,
  putQuery,
  readAllQueries,
} from "../../utils/idb.utils";
import { failureKindOf } from "../../utils/write.utils";
import type { IQueryEntry } from "../../models/common/query.model";

type ICachedQuery = Pick<IQueryEntry, "data" | "updatedAt">;

type IRequest = { id: number; result: Promise<unknown> };

type States = {
  entries: Record<string, IQueryEntry>;
  watchers: Record<string, number>;
  statusWatchers: Record<string, number>;
};

type Actions = {
  run: <T>(key: string, fetcher: () => Promise<T>) => Promise<T | undefined>;
  refresh: <T>(
    key: string,
    fetcher: () => Promise<T>
  ) => Promise<T | undefined>;
  prime: (queries: ReadonlyArray<[string, () => Promise<unknown>]>) => void;
  setEntry: (key: string, partial: Partial<IQueryEntry>) => void;
  watch: (key: string, countsTowardStatus: boolean) => void;
  unwatch: (key: string, countsTowardStatus: boolean) => void;
  invalidate: (keyPrefix: string) => void;
  refetchAll: () => void;
  refetchWatched: () => Promise<void>;
  reset: () => void;
};

const notSavedOfflineMessage =
  "Not saved for offline. Connect to the internet once to load this page.";

const networkFailurePrefix = "TypeError";

const cacheMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

const cacheMaxEntries = 120;

const searchVariantPattern = /"search":"[^"]/;

const emptyEntry: IQueryEntry = {
  data: undefined,
  loading: false,
  error: null,
  updatedAt: 0,
};

const initialValues: States = {
  entries: {},
  watchers: {},
  statusWatchers: {},
};

const fetchers = new Map<string, () => Promise<unknown>>();

const primedKeys = new Set<string>();

const requests = new Map<string, IRequest>();

let requestCount = 0;

const ignoreCacheFailure = () => undefined;

const isNetworkFailure = (error: unknown, message: string): boolean =>
  failureKindOf(error) === "network" ||
  message.startsWith(networkFailurePrefix);

const isPersistable = (key: string): boolean =>
  !searchVariantPattern.test(key);

const retainedCacheOf = (
  cached: Record<string, ICachedQuery>,
  now: number
): Record<string, ICachedQuery> =>
  Object.fromEntries(
    Object.entries(cached)
      .filter(
        ([key, value]) =>
          isPersistable(key) && now - value.updatedAt <= cacheMaxAgeMs
      )
      .sort(([, first], [, second]) => second.updatedAt - first.updatedAt)
      .slice(0, cacheMaxEntries)
  );

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

export const useQueryStore = create<States & Actions>((set, get) => {
  const isNewest = (key: string, id: number): boolean =>
    requests.get(key)?.id === id;

  const isRefetched = (key: string): boolean =>
    primedKeys.has(key) || (get().watchers[key] ?? 0) > 0;

  const settle = (
    key: string,
    id: number,
    toEntry: (current: IQueryEntry) => IQueryEntry
  ): boolean => {
    if (!isNewest(key, id)) return false;

    requests.delete(key);
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: toEntry(state.entries[key] ?? emptyEntry),
      },
    }));
    return true;
  };

  const load = async <T>(
    key: string,
    id: number,
    fetcher: () => Promise<T>
  ): Promise<T | undefined> => {
    await cacheReady;

    if (!navigator.onLine) {
      const cached = get().entries[key]?.data as T | undefined;
      settle(key, id, (current) => ({
        ...current,
        loading: false,
        error: current.data === undefined ? notSavedOfflineMessage : null,
      }));
      return cached;
    }

    if (isNewest(key, id)) get().setEntry(key, { loading: true, error: null });

    try {
      const data = await fetcher();
      const updatedAt = Date.now();
      const landed = settle(key, id, () => ({
        data,
        loading: false,
        error: null,
        updatedAt,
      }));
      if (landed && isPersistable(key))
        void putQuery<ICachedQuery>(key, { data, updatedAt }).catch(
          ignoreCacheFailure
        );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      settle(key, id, (current) => {
        const keepsCachedData =
          current.data !== undefined && isNetworkFailure(error, message);

        return {
          ...current,
          loading: false,
          error: keepsCachedData ? null : message,
        };
      });
      return undefined;
    }
  };

  const start = <T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T | undefined> => {
    fetchers.set(key, fetcher);
    requestCount += 1;
    const id = requestCount;
    const result = load(key, id, fetcher);
    requests.set(key, { id, result });
    return result;
  };

  return {
    ...initialValues,

    run: <T>(key: string, fetcher: () => Promise<T>) => {
      const pending = requests.get(key);
      if (!pending) return start(key, fetcher);

      fetchers.set(key, fetcher);
      return pending.result as Promise<T | undefined>;
    },

    refresh: start,

    prime: (queries) => {
      for (const [key, fetcher] of queries) {
        primedKeys.add(key);
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

    watch: (key, countsTowardStatus) =>
      set((state) => ({
        watchers: { ...state.watchers, [key]: (state.watchers[key] ?? 0) + 1 },
        statusWatchers: countsTowardStatus
          ? { ...state.statusWatchers, [key]: (state.statusWatchers[key] ?? 0) + 1 }
          : state.statusWatchers,
      })),

    unwatch: (key, countsTowardStatus) => {
      set((state) => ({
        watchers: { ...state.watchers, [key]: (state.watchers[key] ?? 1) - 1 },
        statusWatchers: countsTowardStatus
          ? { ...state.statusWatchers, [key]: (state.statusWatchers[key] ?? 1) - 1 }
          : state.statusWatchers,
      }));
      if (!isRefetched(key)) fetchers.delete(key);
    },

    invalidate: (keyPrefix) => {
      const matches = Object.keys(get().entries).filter(
        (key) => key === keyPrefix || key.startsWith(`${keyPrefix}:`)
      );

      for (const key of matches) {
        const fetcher = fetchers.get(key);
        if (fetcher) void start(key, fetcher);
      }
    },

    refetchAll: () => {
      for (const [key, fetcher] of fetchers) void start(key, fetcher);
    },

    refetchWatched: async () => {
      const watchedKeys = Object.entries(get().watchers)
        .filter(([, count]) => count > 0)
        .map(([key]) => key);
      await Promise.all(
        watchedKeys.flatMap((key) => {
          const fetcher = fetchers.get(key);
          return fetcher ? [start(key, fetcher)] : [];
        })
      );
    },

    reset: () => {
      fetchers.clear();
      primedKeys.clear();
      requests.clear();
      set({ entries: {} });
      void clearQueries().catch(ignoreCacheFailure);
    },
  };
});

const cacheReady: Promise<void> = readAllQueries<ICachedQuery>()
  .then((cached) => {
    const retained = retainedCacheOf(cached, Date.now());
    const dropped = Object.keys(cached).filter((key) => !(key in retained));

    void deleteQueries(dropped).catch(ignoreCacheFailure);
    useQueryStore.setState((state) => ({
      entries: hydrate(state.entries, retained),
    }));
  })
  .catch(ignoreCacheFailure);

export const selectEntry =
  <T>(key: string) =>
  (state: States): IQueryEntry<T> =>
    (state.entries[key] as IQueryEntry<T> | undefined) ??
    (emptyEntry as IQueryEntry<T>);

const watchedEntriesOf = (state: States): IQueryEntry[] =>
  Object.entries(state.statusWatchers)
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
