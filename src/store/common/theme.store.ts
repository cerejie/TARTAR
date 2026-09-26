import { create } from "zustand";
import { persist } from "zustand/middleware";
import { themeStorageKey } from "../../keys/storage.keys";

export type IThemeMode = "light" | "dark";

type States = {
  mode: IThemeMode;
};

type Actions = {
  toggleMode: () => void;
};

const initialValues: States = {
  mode: "light",
};

export const selectThemeMode = (state: States) => state.mode;

export const useThemeStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      toggleMode: () =>
        set((state) => ({ mode: state.mode === "dark" ? "light" : "dark" })),
    }),
    {
      name: themeStorageKey,
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
