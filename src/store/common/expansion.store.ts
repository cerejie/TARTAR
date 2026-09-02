import { create } from "./reset.store";

type States = {
  expandedRows: Record<string, string | null>;
  collapsingRows: Record<string, string | null>;
};

type Actions = {
  setExpandedRow: (key: string, rowKey: string | null) => void;
  clearCollapsingRow: (key: string, rowKey: string) => void;
};

const initialValues: States = {
  expandedRows: {},
  collapsingRows: {},
};

export const useExpansionStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setExpandedRow: (key, rowKey) =>
    set((state) => {
      const previous = state.expandedRows[key] ?? null;
      return {
        expandedRows: { ...state.expandedRows, [key]: rowKey },
        collapsingRows: {
          ...state.collapsingRows,
          [key]: previous && previous !== rowKey ? previous : null,
        },
      };
    }),
  clearCollapsingRow: (key, rowKey) =>
    set((state) =>
      state.collapsingRows[key] === rowKey
        ? { collapsingRows: { ...state.collapsingRows, [key]: null } }
        : state
    ),
}));

export const selectExpandedRow = (key: string) => (state: States) =>
  state.expandedRows[key] ?? null;

export const selectCollapsingRow = (key: string) => (state: States) =>
  state.collapsingRows[key] ?? null;
