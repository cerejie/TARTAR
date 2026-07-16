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

  /**
   * Generic keyed modal state so pages never need `useState` for open/close or
   * for tracking which record a modal is acting on. `recordId` lets a shared
   * modal (e.g. "record payment") know its target row.
   */
  modals: Record<string, { open: boolean; recordId: string | null }>
  openModal: (key: string, recordId?: string | null) => void
  closeModal: (key: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  siderCollapsed: false,
  toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),

  branchFilter: null,
  setBranchFilter: (branch) => set({ branchFilter: branch }),

  filters: {},
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: {} }),

  modals: {},
  openModal: (key, recordId = null) =>
    set((s) => ({ modals: { ...s.modals, [key]: { open: true, recordId } } })),
  closeModal: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: { open: false, recordId: null } } })),
}))

// Stable reference for the "no modal open" case. Returning a fresh object
// literal here would give useSyncExternalStore a new snapshot every render and
// loop infinitely on pages that read a modal before it has ever been opened.
const CLOSED_MODAL = { open: false, recordId: null } as const

/** Selector for a modal's state (defaults to closed). */
export const selectModal = (key: string) => (s: UiState) =>
  s.modals[key] ?? CLOSED_MODAL
