import { z } from 'zod'
import {
  labels,
  voucherKindCategory,
  voucherKindSchema,
  voucherTypeSchema,
  type VoucherStatus,
  type VoucherType,
} from './enums'
import { branchSlugSchema } from './branch'

/**
 * Check/cash vouchers (build spec §16). Employees create them as `pending`;
 * only a manager (Admin/superAdmin) may approve, and only an approved voucher
 * may be printed. The approval + printed gating is enforced by RLS.
 */
export interface Voucher {
  id: string
  voucher_no: string | null
  type: VoucherType
  branch: string
  payee: string
  amount: number
  purpose: string | null
  status: VoucherStatus
  printed: boolean
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  /** Source purchase/expense when auto-generated (null = manual voucher). */
  transaction_id: string | null
  supplier_id: string | null
  /** Numbering category code (PUR, EXP, ELC, …, GEN for legacy manual rows). */
  category: string
  /** Due date carried onto the payable when a purchase voucher is approved. */
  due_date: string | null
  /** Payable created by approval (null until an admin approves a purchase). */
  payable_id: string | null
}

const amountField = z.coerce
  .number({ message: 'Enter a valid amount' })
  .positive('Amount must be greater than zero')
  .max(1_000_000_000)

const isoDateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')

/**
 * Manual-voucher create form. Status/printed/voucher_no are server-side.
 * The old free-text purpose is gone (client decision 2026-07-19): the creator
 * picks expense or purchase, and a purchase also needs a due date because
 * approving it opens a payable.
 */
export const voucherSchema = z
  .object({
    type: voucherTypeSchema,
    kind: voucherKindSchema,
    branch: branchSlugSchema,
    payee: z.string().trim().min(1, 'Payee is required').max(160),
    amount: amountField,
    supplier_id: z.string().uuid().nullable().optional(),
    due_date: isoDateField.nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'purchase' && !v.due_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['due_date'],
        message: 'A purchase needs a due date — approval creates a payable',
      })
    }
  })
export type VoucherInput = z.infer<typeof voucherSchema>

/**
 * What to show in the Purpose slot. Auto-generated vouchers carry the source
 * transaction's description; manual ones now only carry their category code.
 */
export function voucherPurpose(v: Pick<Voucher, 'purpose' | 'category'>): string {
  if (v.purpose) return v.purpose
  if (v.category === voucherKindCategory.purchase) return labels.voucherKind.purchase
  if (v.category === voucherKindCategory.expense) return labels.voucherKind.expense
  return '—'
}
