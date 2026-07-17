import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { Voucher, VoucherInput } from '../models'

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

export async function createVoucher(input: VoucherInput, createdBy: string | null) {
  return runWrite({
    label: `Voucher for ${input.payee} · ${input.amount}`,
    kind: 'insert',
    table: 'vouchers',
    values: {
      type: input.type,
      branch: input.branch,
      payee: input.payee,
      amount: input.amount,
      purpose: input.purpose ?? null,
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
