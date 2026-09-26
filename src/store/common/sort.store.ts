import type { ISortState } from "../../models/common/table.model";
import { create } from "./reset.store";

type States = {
  sorts: Record<string, ISortState | null>;
};

type Actions = {
  setSort: (key: string, sort: ISortState | null) => void;
};

const initialValues: States = {
  sorts: {},
};

export const useSortStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSort: (key, sort) =>
    set((state) => ({ sorts: { ...state.sorts, [key]: sort } })),
}));

export const selectSort = (key: string) => (state: States) =>
  state.sorts[key] ?? null;
