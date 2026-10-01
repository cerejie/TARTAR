import { create } from "./reset.store";

type States = {
  distance: number;
  refreshing: boolean;
};

type Actions = {
  setDistance: (distance: number) => void;
  setRefreshing: (refreshing: boolean) => void;
};

const initialValues: States = {
  distance: 0,
  refreshing: false,
};

export const usePullStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setDistance: (distance) => set({ distance }),
  setRefreshing: (refreshing) => set({ refreshing }),
}));

export const selectPullDistance = (state: States) => state.distance;

export const selectPullRefreshing = (state: States) => state.refreshing;
