import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import { voucherKindCategory, type Voucher, type VoucherInput } from '../models'

/**
 * Voucher approval workflow (build spec §16): Employee creates a `pending`
 * voucher → manager approves → only then may it be printed. Approval and
 * printing are manager-only (enforced by RLS); this service exposes them but the
 * DB is the real gate.
 */
export async function listVouchers(
  filters: { status?: string; branch?: string } = {},
): Promise<Voucher[]> {
  let query = supabase.from('vouchers').select('*')
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.branch) query = query.eq('branch', filters.branch)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw toError(error)
  return (data ?? []) as Voucher[]
}

/**
 * Manual voucher. The chosen kind becomes the numbering category; a purchase
 * also carries supplier + due date, which the DB turns into a payable when a
 * manager approves it (client decision 2026-07-19).
 */
export async function createVoucher(input: VoucherInput, createdBy: string | null) {
  const isPurchase = input.kind === 'purchase'
  // Check details describe the instrument, so a cash voucher must not keep the
  // values a user typed before switching the type (the DB rejects them too).
  const isCheck = input.type === 'check'
  return runWrite({
    label: `Voucher for ${input.payee} · ${input.amount}`,
    kind: 'insert',
    table: 'vouchers',
    values: {
      type: input.type,
      branch: input.branch,
      payee: input.payee,
      amount: input.amount,
      // Manual vouchers no longer take a free-text purpose — `category` is it.
      purpose: null,
      category: voucherKindCategory[input.kind],
      supplier_id: isPurchase ? (input.supplier_id ?? null) : null,
      due_date: isPurchase ? (input.due_date ?? null) : null,
      check_bank: isCheck ? (input.check_bank ?? null) : null,
      check_number: isCheck ? (input.check_number ?? null) : null,
      check_due_date: isCheck ? (input.check_due_date ?? null) : null,
      status: 'pending',
      printed: false,
      created_by: createdBy,
    },
  })
}

/** Manager approves/rejects. Approval is only meaningful online (needs the gate). */
export async function decideVoucher(id: string, approve: boolean, approverId: string | null) {
  return runWrite({
    label: `${approve ? 'Approve' : 'Reject'} voucher`,
    kind: 'update',
    table: 'vouchers',
    values: {
      status: approve ? 'approved' : 'rejected',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    },
    match: { id },
  })
}

/** Mark an approved voucher as printed. RLS blocks printing unapproved ones. */
export async function markVoucherPrinted(id: string) {
  return runWrite({
    label: 'Mark voucher printed',
    kind: 'update',
    table: 'vouchers',
    values: { printed: true },
    match: { id },
  })
}
