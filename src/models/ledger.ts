import { z } from 'zod'
import { type LedgerStatus } from './enums'
import { branchSlugSchema } from './branch'

/**
 * Receivables (customers pay later) and Payables (bought on credit) share the
 * same shape aside from the counterparty label, so one model + form config
 * serves both (build spec §9). `paid_amount` drives the open/partial/paid status.
 */
interface LedgerBase {
  id: string
  branch: string
  amount: number
  paid_amount: number
  due_date: string
  reference_number: string | null
  status: LedgerStatus
  created_by: string | null
  created_at: string
}

export interface Receivable extends LedgerBase {
  customer_id: string | null
  customer_name: string
}

export interface Payable extends LedgerBase {
  supplier_id: string | null
  supplier_name: string
}

const amountField = z.coerce
  .number({ message: 'Enter a valid amount' })
  .positive('Amount must be greater than zero')
  .max(1_000_000_000)

const isoDateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')

export const receivableSchema = z.object({
  branch: branchSlugSchema,
  customer_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().trim().min(1, 'Customer name is required').max(160),
  amount: amountField,
  due_date: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
})
export type ReceivableInput = z.infer<typeof receivableSchema>

export const payableSchema = z.object({
  branch: branchSlugSchema,
  supplier_id: z.string().uuid().nullable().optional(),
  supplier_name: z.string().trim().min(1, 'Supplier name is required').max(160),
  amount: amountField,
  due_date: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
})
export type PayableInput = z.infer<typeof payableSchema>

/** Recording a payment against a receivable/payable. */
export const settlementSchema = z.object({
  amount: amountField,
})
export type SettlementInput = z.infer<typeof settlementSchema>

/**
 * Customer Ledger (receivables by customer). Receivables may reference a saved
 * customer (`customer_id`) or a free-typed name, so a ledger identity carries
 * both and matches on id when present, name otherwise.
 */
export interface CustomerLedgerKey {
  customerId: string | null
  customerName: string
}

/** Aggregated per-customer receivables view — computed, never stored. */
export interface CustomerReceivableSummary extends CustomerLedgerKey {
  /** SUM(amount - paid_amount) across the customer's receivables. */
  outstanding: number
  /** Count of receivables not yet fully paid. */
  unpaidCount: number
  /** Most recent receivable `created_at`. */
  lastTransactionAt: string | null
}
