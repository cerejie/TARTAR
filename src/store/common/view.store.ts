import { create } from "./reset.store";

type States = {
  searches: Record<string, string>;
};

type Actions = {
  setSearch: (key: string, value: string) => void;
};

const initialValues: States = {
  searches: {},
};

export const useViewStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setSearch: (key, value) =>
    set((state) => ({ searches: { ...state.searches, [key]: value } })),
}));

export const selectSearch = (key: string) => (state: States) =>
  state.searches[key] ?? "";
