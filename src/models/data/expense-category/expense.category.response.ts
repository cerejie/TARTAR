import { z } from "zod";

export const expenseCategorySlugSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, "Invalid expense category");

export interface IExpenseCategory {
  slug: string;
  name: string;
  code: string;
  sort: number;
  active: boolean;
  created_at: string;
}
