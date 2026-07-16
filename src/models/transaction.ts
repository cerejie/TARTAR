import { z } from 'zod'
import {
  cashAccountSchema,
  expenseTypeSchema,
  incomeSourceSchema,
  transactionTypeSchema,
  type CashAccount,
  type ExpenseType,
  type IncomeSource,
  type TransactionType,
} from './enums'
import { FARM_BRANCH, branchSlugSchema, farmSectionSlugSchema } from './branch'

/**
 * Transactions ledger — everything employees encode (build spec §7). Joined
 * customer/supplier names are optional (populated by the service via select).
 */
export interface Transaction {
  id: string
  type: TransactionType
  branch: string
  farm_section: string | null
  txn_date: string
  amount: number
  reference_number: string | null
  description: string | null
  customer_id: string | null
  supplier_id: string | null
  cash_account: CashAccount | null
  income_source: IncomeSource | null
  expense_type: ExpenseType | null
  created_by: string | null
  created_at: string
  // Optional joined labels (from `customers(name)` / `suppliers(name)` selects).
  customer?: { name: string } | null
  supplier?: { name: string } | null
}

/** A monetary amount as typed in a form: coerced from string, must be > 0. */
const amountField = z.coerce
  .number({ message: 'Enter a valid amount' })
  .positive('Amount must be greater than zero')
  .max(1_000_000_000)

const isoDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')

export const transactionSchema = z
  .object({
    type: transactionTypeSchema,
    branch: branchSlugSchema,
    farm_section: farmSectionSlugSchema.nullable().optional(),
    txn_date: isoDateField,
    amount: amountField,
    reference_number: z.string().trim().max(80).nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
    supplier_id: z.string().uuid().nullable().optional(),
    cash_account: cashAccountSchema.nullable().optional(),
    income_source: incomeSourceSchema.nullable().optional(),
    expense_type: expenseTypeSchema.nullable().optional(),
  })
  // A farm section is only meaningful on the Farm branch (mirrors the DB check).
  .refine((v) => !v.farm_section || v.branch === FARM_BRANCH, {
    path: ['farm_section'],
    message: 'Farm section only applies to the Farm branch',
  })
  // Sales carry an income source; expenses carry an expense type.
  .refine((v) => v.type !== 'sale' || !!v.income_source, {
    path: ['income_source'],
    message: 'Select an income source for a sale',
  })
  .refine((v) => v.type !== 'expense' || !!v.expense_type, {
    path: ['expense_type'],
    message: 'Select an expense type',
  })
export type TransactionInput = z.infer<typeof transactionSchema>
