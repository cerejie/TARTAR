import { create } from 'zustand'
import type { LedgerFilters } from '../services/filters'

/**
 * Cross-cutting UI state. Per the hard rules we never use `useState` — even
 * transient UI toggles (sidebar, active branch filter, the currently open
 * modal) live here so components stay pure and state is inspectable.
 */
interface UiState {
  siderCollapsed: boolean
  toggleSider: () => void

  /** Global branch filter (null = all branches the user may see). */
  branchFilter: string | null
  setBranchFilter: (branch: string | null) => void

  /** Shared ledger search/filter panel state (reused across list pages). */
  filters: LedgerFilters
  setFilters: (patch: Partial<LedgerFilters>) => void
  resetFilters: () => void
}

export const useUiStore = create<UiState>((set) => ({
  siderCollapsed: false,
  toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),

  branchFilter: null,
  setBranchFilter: (branch) => set({ branchFilter: branch }),

  filters: {},
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: {} }),
}))
