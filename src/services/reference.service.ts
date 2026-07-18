import { supabase, toError } from './supabase'
import { slugifyBranch, type Branch, type BranchInput, type FarmSection } from '../models'

/** Reference/master data (branches, farm sections). Rarely changes — cached in a store. */

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
  const slug = slugifyBranch(input.name)
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
