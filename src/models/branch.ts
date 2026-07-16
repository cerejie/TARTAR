import { z } from 'zod'

/**
 * Branches = the four TARTAR business units (build spec §6). Slugs mirror the
 * seeded `public.branches` rows. The Farm unit is further split into sections.
 */
export const branchSlugValues = ['hardware', 'rental', 'woodworks', 'farm'] as const
export const branchSlugSchema = z.enum(branchSlugValues)
export type BranchSlug = z.infer<typeof branchSlugSchema>

export const farmSectionSlugValues = ['banana', 'rubber', 'coconut', 'fruit'] as const
export const farmSectionSlugSchema = z.enum(farmSectionSlugValues)
export type FarmSectionSlug = z.infer<typeof farmSectionSlugSchema>

export interface Branch {
  slug: BranchSlug
  name: string
  sort: number
}

export interface FarmSection {
  slug: FarmSectionSlug
  name: string
}

/** Only the Farm branch may carry a farm section (matches the DB check). */
export const FARM_BRANCH: BranchSlug = 'farm'
