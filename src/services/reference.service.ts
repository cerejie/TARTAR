import { supabase, toError } from './supabase'
import {
  slugify,
  type Branch,
  type BranchInput,
  type ExpenseCategory,
  type ExpenseCategoryInput,
  type FarmSection,
} from '../models'

/**
 * Reference/master data (branches, farm sections, expense categories). Rarely
 * changes — cached in a store.
 */

const BRANCH_COLS = 'slug, name, sort, active, voucher_prefix'

/** Active branches only — feeds every branch selector across the app. */
export async function listBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select(BRANCH_COLS)
    .eq('active', true)
    .order('sort', { ascending: true })
  if (error) throw toError(error)
  return (data ?? []) as Branch[]
}

/** Every branch including archived ones — for the branch management screen. */
export async function listAllBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select(BRANCH_COLS)
    .order('sort', { ascending: true })
  if (error) throw toError(error)
  return (data ?? []) as Branch[]
}

/**
 * Create a branch (managers only — enforced by the `ref_write_branches` RLS
 * policy). The slug is derived from the name and is immutable thereafter, since
 * it is the FK target for transactions, cash accounts, vouchers, etc.
 */
export async function createBranch(input: BranchInput): Promise<Branch> {
  const slug = slugify(input.name)
  if (!slug) throw new Error('Branch name must contain letters or numbers')

  const { data, error } = await supabase
    .from('branches')
    .insert({
      slug,
      name: input.name.trim(),
      sort: input.sort,
      active: true,
      voucher_prefix: input.voucher_prefix,
    })
    .select(BRANCH_COLS)
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('A branch with a similar name already exists')
    throw toError(error)
  }
  return data as Branch
}

/** Rename / re-order a branch. The slug is never changed (it is an FK target).
 *  A prefix change only affects vouchers numbered from now on — existing
 *  voucher numbers are stored text and never rewritten. */
export async function updateBranch(slug: string, input: BranchInput): Promise<void> {
  const { error } = await supabase
    .from('branches')
    .update({ name: input.name.trim(), sort: input.sort, voucher_prefix: input.voucher_prefix })
    .eq('slug', slug)
  if (error) throw toError(error)
}

/** Archive / restore a branch (soft delete — keeps historical rows intact). */
export async function setBranchActive(slug: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('branches').update({ active }).eq('slug', slug)
  if (error) throw toError(error)
}

export async function listFarmSections(): Promise<FarmSection[]> {
  const { data, error } = await supabase
    .from('farm_sections')
    .select('slug, name')
    .order('name', { ascending: true })
  if (error) throw toError(error)
  return (data ?? []) as FarmSection[]
}

// --- Expense categories -----------------------------------------------------
// Master data behind the Expenses form's "Expense type" selector. Managed on
// the Master Data screen; writes are managers-only via the
// `ref_write_expense_categories` RLS policy.

const EXPENSE_CATEGORY_COLS = 'slug, name, code, sort, active, created_at'

const orderedCategories = () =>
  supabase
    .from('expense_categories')
    .select(EXPENSE_CATEGORY_COLS)
    .order('sort', { ascending: true })
    .order('name', { ascending: true })

/** Active categories only — feeds the expense form selector. */
export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await orderedCategories().eq('active', true)
  if (error) throw toError(error)
  return (data ?? []) as ExpenseCategory[]
}

/** Every category including archived ones — for the management screen and for
 *  labelling historical rows whose category has since been archived. */
export async function listAllExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await orderedCategories()
  if (error) throw toError(error)
  return (data ?? []) as ExpenseCategory[]
}

/** Postgres unique-violation → a message naming the field that actually clashed. */
function categoryConflict(code: string, message: string): Error {
  return new Error(
    message.includes('code')
      ? `Voucher code ${code} is already used by another category`
      : 'A category with a similar name already exists',
  )
}

/**
 * Create a category. The slug is derived from the name and is immutable
 * thereafter — it is the FK target on `transactions.expense_type`.
 */
export async function createExpenseCategory(input: ExpenseCategoryInput): Promise<ExpenseCategory> {
  const slug = slugify(input.name)
  if (!slug) throw new Error('Category name must contain letters or numbers')

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({ slug, name: input.name.trim(), code: input.code, sort: input.sort, active: true })
    .select(EXPENSE_CATEGORY_COLS)
    .single()
  if (error) {
    if (error.code === '23505') throw categoryConflict(input.code, error.message)
    throw toError(error)
  }
  return data as ExpenseCategory
}

/** Rename / re-code / re-order a category. The slug never changes (FK target).
 *  A code change only affects vouchers numbered from now on — voucher numbers
 *  already issued are stored text and never rewritten. */
export async function updateExpenseCategory(
  slug: string,
  input: ExpenseCategoryInput,
): Promise<void> {
  const { error } = await supabase
    .from('expense_categories')
    .update({ name: input.name.trim(), code: input.code, sort: input.sort })
    .eq('slug', slug)
  if (error) {
    if (error.code === '23505') throw categoryConflict(input.code, error.message)
    throw toError(error)
  }
}

/** Archive / restore a category (soft delete — keeps historical rows intact). */
export async function setExpenseCategoryActive(slug: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('expense_categories').update({ active }).eq('slug', slug)
  if (error) throw toError(error)
}

/** Permanently remove a category. Only possible while no expense references it
 *  — the FK blocks the rest, and archiving is the answer in that case. */
export async function deleteExpenseCategory(slug: string): Promise<void> {
  const { error } = await supabase.from('expense_categories').delete().eq('slug', slug)
  if (error) {
    if (error.code === '23503') {
      throw new Error('This category is used by existing expenses — archive it instead')
    }
    throw toError(error)
  }
}
