import { create } from "zustand";
import type { IQueryEntry } from "../../models/common/query.model";

type States = {
  entries: Record<string, IQueryEntry>;
};

type Actions = {
  run: <T>(key: string, fetcher: () => Promise<T>) => Promise<T | undefined>;
  setEntry: (key: string, partial: Partial<IQueryEntry>) => void;
  invalidate: (keyPrefix: string) => void;
  reset: () => void;
};

const emptyEntry: IQueryEntry = {
  data: undefined,
  loading: false,
  error: null,
  updatedAt: 0,
};

const initialValues: States = {
  entries: {},
};

const fetchers = new Map<string, () => Promise<unknown>>();

export const useQueryStore = create<States & Actions>((set, get) => ({
  ...initialValues,

  run: async (key, fetcher) => {
    fetchers.set(key, fetcher as () => Promise<unknown>);
    const previous = get().entries[key] ?? emptyEntry;

    set((state) => ({
      entries: {
        ...state.entries,
        [key]: { ...previous, loading: true, error: null },
      },
    }));

    try {
      const data = await fetcher();
      set((state) => ({
        entries: {
          ...state.entries,
          [key]: { data, loading: false, error: null, updatedAt: Date.now() },
        },
      }));
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      set((state) => ({
        entries: {
          ...state.entries,
          [key]: {
            ...(state.entries[key] ?? emptyEntry),
            loading: false,
            error: message,
          },
        },
      }));
      return undefined;
    }
  },

  setEntry: (key, partial) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: { ...(state.entries[key] ?? emptyEntry), ...partial },
      },
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

  reset: () => {
    fetchers.clear();
    set({ entries: {} });
  },
}));

export const selectEntry =
  <T>(key: string) =>
  (state: States): IQueryEntry<T> =>
    (state.entries[key] as IQueryEntry<T> | undefined) ??
    (emptyEntry as IQueryEntry<T>);
