import { create } from "zustand";
import type { IBeforeInstallPromptEvent } from "../../models/common/install.model";

type States = {
  installPrompt: IBeforeInstallPromptEvent | null;
  installed: boolean;
};

type Actions = {
  setInstallPrompt: (installPrompt: IBeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
};

const standaloneQuery = "(display-mode: standalone)";

const isRunningInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  const iosStandalone = "standalone" in navigator && navigator.standalone === true;
  return iosStandalone || window.matchMedia(standaloneQuery).matches;
};

const initialValues: States = {
  installPrompt: null,
  installed: isRunningInstalled(),
};

export const useInstallStore = create<States & Actions>((set) => ({
  ...initialValues,
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  setInstalled: (installed) => set({ installed }),
}));

export const selectInstallPrompt = (state: States) => state.installPrompt;

export const selectInstalled = (state: States) => state.installed;
