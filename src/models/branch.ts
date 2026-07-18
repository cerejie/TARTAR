import { z } from 'zod'

/**
 * Branches = the TARTAR business units (build spec §6). Managers can add more at
 * runtime, so a branch slug is any string referencing `public.branches.slug`
 * (not a closed enum). The Farm unit is further split into fixed sections.
 */

/** The originally-seeded slugs. Kept only as a convenience list (e.g. sensible
 *  form defaults) — it is NOT the set of valid branches at runtime. */
export const branchSlugValues = ['hardware', 'rental', 'woodworks', 'farm'] as const

/** Open branch-slug schema; format mirrors the DB CHECK and `slugifyBranch`. */
export const branchSlugSchema = z.string().regex(/^[a-z0-9_]+$/, 'Invalid branch')
export type BranchSlug = z.infer<typeof branchSlugSchema>

export const farmSectionSlugValues = ['banana', 'rubber', 'coconut', 'fruit'] as const
export const farmSectionSlugSchema = z.enum(farmSectionSlugValues)
export type FarmSectionSlug = z.infer<typeof farmSectionSlugSchema>

export interface Branch {
  slug: BranchSlug
  name: string
  sort: number
  /** false = archived: hidden from selectors but kept for historical rows. */
  active: boolean
  /** 3-letter voucher numbering prefix (e.g. LGC). Changing it only affects
   *  newly generated voucher numbers — history keeps its original prefix. */
  voucher_prefix: string
}

/** Create/edit form for a branch. The slug is derived from the name and is
 *  immutable once created, so the form only collects a display name + order. */
export const branchSchema = z.object({
  name: z.string().trim().min(2, 'Enter a branch name').max(80),
  sort: z.number({ error: 'Enter a number' }).int('Whole number only').min(0).max(999),
  voucher_prefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, '3 letters, e.g. LGC'),
})
export type BranchInput = z.infer<typeof branchSchema>

/** Derive a DB-safe slug from a branch name — matches `branches_slug_format_chk`
 *  (`^[a-z0-9_]+$`). Returns '' when the name has no usable characters. */
export function slugifyBranch(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export interface FarmSection {
  slug: FarmSectionSlug
  name: string
}

/** Only the Farm branch may carry a farm section (matches the DB check). */
export const FARM_BRANCH: BranchSlug = 'farm'
