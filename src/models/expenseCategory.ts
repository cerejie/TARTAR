import { z } from 'zod'

/**
 * Expense categories are master data, not a fixed enum — managers add, rename
 * and archive them from the Master Data screen (client decision 2026-07-21).
 * Each category owns the 3-letter voucher category code its expense vouchers
 * are numbered under (ELC, WTR, SAL, …); the code is what `voucher_counters`
 * sequences against, so it is unique across categories.
 */
export interface ExpenseCategory {
  slug: string
  name: string
  code: string
  sort: number
  /** false = archived: hidden from the expense form, kept for historical rows. */
  active: boolean
  created_at: string
}

/** Slug of an expense category — an open string (rows reference the table). */
export const expenseCategorySlugSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, 'Invalid expense category')

/**
 * Create/edit form. The slug is derived from the name and immutable once
 * created (it is the FK target on `transactions.expense_type`), so the form
 * only collects the display name, code and order.
 */
export const expenseCategorySchema = z.object({
  name: z.string().trim().min(2, 'Enter a category name').max(80),
  // Changing the code only affects vouchers numbered from now on — numbers
  // already issued are stored text and never rewritten (same rule as a branch
  // voucher prefix).
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, '3 letters, e.g. FUE'),
  sort: z.number({ error: 'Enter a number' }).int('Whole number only').min(0).max(999),
})
export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>
