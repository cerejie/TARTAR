import { create } from "zustand";

type States = {
  online: boolean;
};

type Actions = {
  setOnline: (online: boolean) => void;
};

const initialValues: States = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
};

export const useNetworkStore = create<States & Actions>((set) => ({
  ...initialValues,
  setOnline: (online: boolean) => set(() => ({ online })),
}));
