import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { AllocationDraft, LedgerPayment, PaymentKind } from '../models'

/**
 * Ledger payment recording + verification (client decisions 2026-07).
 * Recording goes through the `record_ledger_payment` RPC: balances update
 * immediately, the payment starts pending (managers self-verify), and the
 * whole thing is atomic + offline-queueable. Verification is a plain update
 * (manager-only via RLS); rejection is an RPC that reverses the allocations.
 */
export async function listPayments(
  kind: PaymentKind,
  filters: { partyId?: string | null; partyName?: string } = {},
): Promise<LedgerPayment[]> {
  let query = supabase.from('payments').select('*').eq('kind', kind)
  if (filters.partyId) {
    query = query.eq(kind === 'receivable' ? 'customer_id' : 'supplier_id', filters.partyId)
  } else if (filters.partyName) {
    // Free-typed parties have no id — match the stored display name.
    query = query.is(kind === 'receivable' ? 'customer_id' : 'supplier_id', null).eq('party_name', filters.partyName)
  }
  const { data, error } = await query.order('paid_at', { ascending: false }).limit(300)
  if (error) throw toError(error)
  return (data ?? []) as LedgerPayment[]
}

export interface RecordPaymentInput {
  partyId: string | null
  partyName: string
  paidAt: string
  referenceNumber: string | null
  allocations: AllocationDraft[]
}

export async function recordPayment(kind: PaymentKind, input: RecordPaymentInput, createdBy: string | null) {
  const amount = input.allocations.reduce((sum, a) => sum + a.amount, 0)
  return runWrite({
    label: `Payment ${amount} · ${input.partyName}`,
    kind: 'rpc',
    fn: 'record_ledger_payment',
    args: {
      p_kind: kind,
      p_party_id: input.partyId,
      p_party_name: input.partyName,
      p_amount: amount,
      p_paid_at: input.paidAt,
      p_reference_number: input.referenceNumber,
      p_allocations: input.allocations.map((a) => ({ ledger_id: a.ledgerId, amount: a.amount })),
      p_created_by: createdBy,
    },
  })
}

/** Manager confirms a pending payment (verify/approve — RLS is the gate). */
export async function verifyPayment(id: string, verifierId: string | null) {
  return runWrite({
    label: 'Verify payment',
    kind: 'update',
    table: 'payments',
    values: { status: 'verified', verified_by: verifierId, verified_at: new Date().toISOString() },
    match: { id, status: 'pending' },
  })
}

/** Manager rejects a payment — reverses the ledger balances, keeps the row. */
export async function rejectPayment(id: string) {
  return runWrite({
    label: 'Reject payment',
    kind: 'rpc',
    fn: 'reject_payment',
    args: { p_payment_id: id },
  })
}
