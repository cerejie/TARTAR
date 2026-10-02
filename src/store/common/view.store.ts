import { create } from "./reset.store";

import type { ISearchMode } from "../../models/common/view.model";

type States = {
  searches: Record<string, string>;
  searchMode: ISearchMode | null;
};

type Actions = {
  setSearch: (key: string, value: string) => void;
  openSearchMode: (searchMode: ISearchMode) => void;
  closeSearchMode: () => void;
};

const initialValues: States = {
  searches: {},
  searchMode: null,
};

export const useViewStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSearch: (key, value) =>
    set((state) => ({ searches: { ...state.searches, [key]: value } })),
  openSearchMode: (searchMode) => set({ searchMode }),
  closeSearchMode: () => set({ searchMode: null }),
}));

export const selectSearch = (key: string) => (state: States) =>
  state.searches[key] ?? "";

export const selectSearchMode = (state: States) => state.searchMode;
