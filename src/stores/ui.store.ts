import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LedgerFilters } from '../services/filters'
import type { CustomerLedgerKey } from '../models'

/**
 * Cross-cutting UI state. Per the hard rules we never use `useState` — even
 * transient UI toggles (sidebar, active branch filter, the currently open
 * modal) live here so components stay pure and state is inspectable.
 */
interface UiState {
  siderCollapsed: boolean
  toggleSider: () => void
  setSiderCollapsed: (collapsed: boolean) => void

  /**
   * True below the sider's responsive breakpoint (antd `lg`, 992px). While
   * broken the sider overlays the page as a drawer instead of sitting in flow,
   * so crossing the breakpoint also snaps it closed.
   */
  siderBroken: boolean
  setSiderBroken: (broken: boolean) => void

  /** Global branch filter (null = all branches the user may see). */
  branchFilter: string | null
  setBranchFilter: (branch: string | null) => void

  /** Shared ledger search/filter panel state (reused across list pages). */
  filters: LedgerFilters
  setFilters: (patch: Partial<LedgerFilters>) => void
  resetFilters: () => void

  /** Receivables: customer whose ledger pane is open inside the picker modal. */
  ledgerCustomer: CustomerLedgerKey | null
  setLedgerCustomer: (customer: CustomerLedgerKey | null) => void
  /**
   * Whether the modal shows the detail pane. Kept apart from `ledgerCustomer`
   * so "back" can slide away with the content still rendered (no blank pane
   * mid-animation); the customer itself is cleared when the modal closes.
   */
  ledgerDetailOpen: boolean
  closeLedgerDetail: () => void

  /**
   * Filters scoped to the customer-ledger pane. Kept separate from `filters`
   * so filtering inside the modal never re-filters the page behind it.
   */
  customerLedgerFilters: LedgerFilters
  setCustomerLedgerFilters: (patch: Partial<LedgerFilters>) => void
  resetCustomerLedgerFilters: () => void

  /** Receivable ids ticked in the ledger pane for a combined payment. */
  ledgerSelection: string[]
  setLedgerSelection: (ids: string[]) => void

  /** Generic keyed search text (e.g. the customer picker modal), no useState. */
  searches: Record<string, string>
  setSearch: (key: string, value: string) => void

  /**
   * Generic keyed modal state so pages never need `useState` for open/close or
   * for tracking which record a modal is acting on. `recordId` lets a shared
   * modal (e.g. "record payment") know its target row.
   */
  modals: Record<string, { open: boolean; recordId: string | null }>
  openModal: (key: string, recordId?: string | null) => void
  closeModal: (key: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      siderCollapsed: false,
      toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),
      setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),

      siderBroken: false,
      setSiderBroken: (broken) => set({ siderBroken: broken, siderCollapsed: broken }),

      branchFilter: null,
      setBranchFilter: (branch) => set({ branchFilter: branch }),

      filters: {},
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: {} }),

      ledgerCustomer: null,
      // Each ledger visit starts with clean pane-scoped filters and selection.
      setLedgerCustomer: (customer) =>
        set({
          ledgerCustomer: customer,
          ledgerDetailOpen: !!customer,
          customerLedgerFilters: {},
          ledgerSelection: [],
        }),
      ledgerDetailOpen: false,
      closeLedgerDetail: () => set({ ledgerDetailOpen: false }),

      customerLedgerFilters: {},
      setCustomerLedgerFilters: (patch) =>
        set((s) => ({ customerLedgerFilters: { ...s.customerLedgerFilters, ...patch } })),
      resetCustomerLedgerFilters: () => set({ customerLedgerFilters: {} }),

      ledgerSelection: [],
      setLedgerSelection: (ids) => set({ ledgerSelection: ids }),

      searches: {},
      setSearch: (key, value) => set((s) => ({ searches: { ...s.searches, [key]: value } })),

      modals: {},
      openModal: (key, recordId = null) =>
        set((s) => ({ modals: { ...s.modals, [key]: { open: true, recordId } } })),
      closeModal: (key) =>
        set((s) => ({ modals: { ...s.modals, [key]: { open: false, recordId: null } } })),
    }),
    {
      name: 'tartar-ui',
      // Only the branch view survives a reload — transient filters/modals don't.
      partialize: (s) => ({ branchFilter: s.branchFilter }),
    },
  ),
)

// Stable reference for the "no modal open" case. Returning a fresh object
// literal here would give useSyncExternalStore a new snapshot every render and
// loop infinitely on pages that read a modal before it has ever been opened.
const CLOSED_MODAL = { open: false, recordId: null } as const

/** Selector for a modal's state (defaults to closed). */
export const selectModal = (key: string) => (s: UiState) =>
  s.modals[key] ?? CLOSED_MODAL
