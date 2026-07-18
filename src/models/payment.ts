import { z } from 'zod'
import type { PaymentKind, PaymentStatus } from './enums'

/**
 * Ledger payments (client decisions 2026-07): one payment may settle several
 * receivables/payables via allocations, applies to balances immediately, and
 * carries a verification status — pending until a manager verifies (receivable
 * terminology) / approves (payable terminology); rejection reverses balances
 * but keeps the row for audit. Managers' own payments self-verify.
 */
export interface LedgerPayment {
  id: string
  kind: PaymentKind
  customer_id: string | null
  supplier_id: string | null
  party_name: string
  amount: number
  paid_at: string
  reference_number: string | null
  status: PaymentStatus
  verified_by: string | null
  verified_at: string | null
  created_by: string | null
  created_at: string
}

export interface PaymentAllocation {
  id: string
  payment_id: string
  receivable_id: string | null
  payable_id: string | null
  amount: number
}

/** One row of the "pay selected records" form (amount typed per receivable). */
export interface AllocationDraft {
  ledgerId: string
  amount: number
}

const isoDateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')

/** Header fields of the allocation payment form (amounts validated per-row). */
export const paymentDetailsSchema = z.object({
  paid_at: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
})
export type PaymentDetailsInput = z.infer<typeof paymentDetailsSchema>

/** Full allocation form: header + one amount per selected receivable. The
 *  amount bounds are enforced by the inputs and re-checked by the RPC. */
export const paymentFormSchema = paymentDetailsSchema.extend({
  amounts: z.record(z.string(), z.coerce.number().min(0)),
})
