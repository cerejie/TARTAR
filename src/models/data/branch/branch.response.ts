import { z } from "zod";

export const branchSlugSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, "Invalid branch");
export type BranchSlug = z.infer<typeof branchSlugSchema>;

export const branchSlugValues = [
  "hardware",
  "rental",
  "woodworks",
  "farm",
] as const;

export const farmSectionSlugValues = [
  "banana",
  "rubber",
  "coconut",
  "fruit",
] as const;
export const farmSectionSlugSchema = z.enum(farmSectionSlugValues);
export type FarmSectionSlug = z.infer<typeof farmSectionSlugSchema>;

export const FARM_BRANCH: BranchSlug = "farm";

export interface IBranch {
  slug: BranchSlug;
  name: string;
  sort: number;
  active: boolean;
  voucher_prefix: string;
}

export interface IFarmSection {
  slug: FarmSectionSlug;
  name: string;
}
