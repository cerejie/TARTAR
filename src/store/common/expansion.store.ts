import { create } from "./reset.store";

type States = {
  expandedRows: Record<string, string | null>;
};

type Actions = {
  setExpandedRow: (key: string, rowKey: string | null) => void;
};

const initialValues: States = {
  expandedRows: {},
};

export const useExpansionStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setExpandedRow: (key, rowKey) =>
    set((state) => ({
      expandedRows: { ...state.expandedRows, [key]: rowKey },
    })),
}));

export const selectExpandedRow = (key: string) => (state: States) =>
  state.expandedRows[key] ?? null;
