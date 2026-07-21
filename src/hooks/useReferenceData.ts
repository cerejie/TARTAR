import { useQuery } from './useQuery'
import { useAuthStore, selectBranchAccess } from '../stores/auth.store'
import * as referenceService from '../services/reference.service'
import type { Branch, ExpenseCategory, FarmSection } from '../models'

/**
 * Loads and caches the reference data (branches, farm sections, expense
 * categories). Branches are narrowed to what the current user may see so branch
 * selectors everywhere are consistently scoped (build spec §6, §13).
 */
export function useBranches() {
  const access = useAuthStore(selectBranchAccess)
  const query = useQuery<Branch[]>('branches', referenceService.listBranches)
  const all = query.data ?? []
  const visible = access === null ? all : all.filter((b) => access.includes(b.slug))
  return { ...query, branches: visible }
}

export function useFarmSections() {
  const query = useQuery<FarmSection[]>('farm-sections', referenceService.listFarmSections)
  return { ...query, farmSections: query.data ?? [] }
}

/**
 * Expense categories (master data). Archived ones are included so historical
 * expenses still render a name; callers offering a selector filter on `active`.
 *
 * @returns `labelOf` resolves a category slug to its display name, falling back
 *          to the raw slug for a row whose category was hard-deleted.
 */
export function useExpenseCategories() {
  const query = useQuery<ExpenseCategory[]>(
    'expense-categories',
    referenceService.listAllExpenseCategories,
  )
  const expenseCategories = query.data ?? []
  const bySlug = new Map(expenseCategories.map((c) => [c.slug, c]))
  return {
    ...query,
    expenseCategories,
    labelOf: (slug: string | null | undefined) => (slug ? (bySlug.get(slug)?.name ?? slug) : '—'),
  }
}
