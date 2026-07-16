import { create } from 'zustand'

/**
 * Online/offline status (build spec §2 — clear offline/online indicator).
 * The actual window event wiring lives in the `useNetwork` hook so this store
 * stays a pure state container. Never read `navigator.onLine` in components —
 * subscribe here so the UI re-renders on change.
 */
interface NetworkState {
  online: boolean
  setOnline: (online: boolean) => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  setOnline: (online) => set({ online }),
}))
