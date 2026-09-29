import { z } from "zod";

export const incomeSourceSlugSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, "Invalid income source");

export interface IIncomeSource {
  slug: string;
  name: string;
  sort: number;
  active: boolean;
  created_at: string;
}
