import { create } from "./reset.store";

type States = {
  positions: Record<string, number>;
};

type Actions = {
  setPosition: (key: string, top: number) => void;
};

const initialValues: States = {
  positions: {},
};

export const useScrollStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setPosition: (key, top) =>
    set((state) => ({ positions: { ...state.positions, [key]: top } })),
}));

export const selectScrollPosition = (key: string) => (state: States) =>
  state.positions[key] ?? 0;

export const selectIsScrolledPast = (key: string, top: number) => (state: States) =>
  (state.positions[key] ?? 0) > top;
