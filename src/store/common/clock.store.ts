import { create } from "zustand";

type States = {
  now: number;
};

type Actions = {
  tick: () => void;
};

const initialValues: States = {
  now: Date.now(),
};

export const useClockStore = create<States & Actions>()((set) => ({
  ...initialValues,
  tick: () => set({ now: Date.now() }),
}));

export const selectNow = (state: States) => state.now;

export const selectTick = (state: Actions) => state.tick;
