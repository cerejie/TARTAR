import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pushPromptStorageKey } from "../../keys/storage.keys";

type States = {
  permission: NotificationPermission | null;
  subscribed: boolean;
  promptDismissed: boolean;
  promptOffered: boolean;
  enableRequested: boolean;
};

type Actions = {
  setPermission: (permission: NotificationPermission | null) => void;
  setSubscribed: (subscribed: boolean) => void;
  dismissPrompt: () => void;
  markPromptOffered: () => void;
  setEnableRequested: (enableRequested: boolean) => void;
};

const initialValues: States = {
  permission: null,
  subscribed: false,
  promptDismissed: false,
  promptOffered: false,
  enableRequested: false,
};

export const usePushStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setPermission: (permission) => set({ permission }),
      setSubscribed: (subscribed) => set({ subscribed }),
      dismissPrompt: () => set({ promptDismissed: true }),
      markPromptOffered: () => set({ promptOffered: true }),
      setEnableRequested: (enableRequested) => set({ enableRequested }),
    }),
    {
      name: pushPromptStorageKey,
      partialize: (state) => ({
        promptDismissed: state.promptDismissed,
        enableRequested: state.enableRequested,
      }),
    }
  )
);

export const selectPushPermission = (state: States) => state.permission;

export const selectPushSubscribed = (state: States) => state.subscribed;

export const selectPushPromptDismissed = (state: States) => state.promptDismissed;

export const selectPushPromptOffered = (state: States) => state.promptOffered;
