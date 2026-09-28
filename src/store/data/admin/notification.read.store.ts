import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notificationReadStorageKey } from "../../../keys/storage.keys";

type States = {
  readIds: string[];
};

type Actions = {
  markRead: (ids: readonly string[]) => void;
};

const maxReadIds = 500;

const initialValues: States = {
  readIds: [],
};

export const selectReadIds = (state: States) => state.readIds;

export const useNotificationReadStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      markRead: (ids) =>
        set((state) => {
          const unseen = ids.filter((id) => !state.readIds.includes(id));
          if (!unseen.length) return state;
          return { readIds: [...state.readIds, ...unseen].slice(-maxReadIds) };
        }),
    }),
    {
      name: notificationReadStorageKey,
      partialize: (state) => ({ readIds: state.readIds }),
    }
  )
);
