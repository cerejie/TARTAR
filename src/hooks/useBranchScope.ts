import { useUiStore } from '../stores/ui.store'
import { useAuthStore, selectIsManager } from '../stores/auth.store'
import { useBranches } from './useReferenceData'
import type { LedgerFilters } from '../services/filters'

/**
 * The global branch view for managers (admin/superAdmin): a single branch they
 * have chosen to focus on from the sidebar, or null for the whole company.
 * Non-managers never get a scope — their visibility is already constrained by
 * `branch_access`/RLS — so this returns null for them regardless of the store.
 */
export function useBranchScope() {
  const isManager = useAuthStore(selectIsManager)
  const stored = useUiStore((s) => s.branchFilter)
  const setBranch = useUiStore((s) => s.setBranchFilter)
  const { branches } = useBranches()

  const branch = isManager ? stored : null
  const branchName = branch
    ? branches.find((b) => b.slug === branch)?.name ?? branch
    : null

  return { enabled: isManager, branch, branchName, setBranch, branches }
}

/** Overlay the global branch scope on page-level filters (the scope wins). */
export function scopedFilters(filters: LedgerFilters, branch: string | null): LedgerFilters {
  return branch ? { ...filters, branch } : filters
}
