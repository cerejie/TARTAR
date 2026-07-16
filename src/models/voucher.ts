import { z } from 'zod'
import { voucherTypeSchema, type VoucherStatus, type VoucherType } from './enums'
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
}

const amountField = z.coerce
  .number({ message: 'Enter a valid amount' })
  .positive('Amount must be greater than zero')
  .max(1_000_000_000)

/** Employee-facing create form. Status/printed are set server-side, not here. */
export const voucherSchema = z.object({
  type: voucherTypeSchema,
  branch: branchSlugSchema,
  payee: z.string().trim().min(1, 'Payee is required').max(160),
  amount: amountField,
  purpose: z.string().trim().max(500).nullable().optional(),
})
export type VoucherInput = z.infer<typeof voucherSchema>
