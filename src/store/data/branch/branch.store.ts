import { create } from "zustand";
import { persist } from "zustand/middleware";
import { branchStorageKey } from "../../../keys/storage.keys";

type States = {
  branchFilter: string | null;
};

type Actions = {
  setBranchFilter: (branch: string | null) => void;
};

const initialValues: States = {
  branchFilter: null,
};

export const useBranchStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      setBranchFilter: (branchFilter) => set({ branchFilter }),
    }),
    { name: branchStorageKey }
  )
);
