import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import { applyLedgerFilters, type LedgerFilters } from './filters'
import {
  labels,
  type Disbursement,
  type DisbursementInput,
  type Transaction,
  type TransactionAudit,
  type TransactionInput,
  type Voucher,
} from '../models'

const SELECT = `
  id, type, branch, farm_section, txn_date, amount, reference_number, description,
  customer_id, supplier_id, cash_account, income_source, expense_type,
  created_by, created_at,
  customer:customers(name), supplier:suppliers(name)
`

/** Transactions ledger service (build spec §7). Reads are filterable (§15). */
export async function listTransactions(filters: LedgerFilters = {}): Promise<Transaction[]> {
  const base = supabase.from('transactions').select(SELECT)
  const query = applyLedgerFilters(base, filters, { date: 'txn_date', amount: 'amount' })
  const { data, error } = await query.order('txn_date', { ascending: false }).limit(500)
  if (error) throw toError(error)
  return (data ?? []) as unknown as Transaction[]
}

export async function createTransaction(input: TransactionInput, createdBy: string | null) {
  return runWrite({
    label: `${labels.transactionType[input.type]} · ${input.amount}`,
    kind: 'insert',
    table: 'transactions',
    values: {
      type: input.type,
      branch: input.branch,
      farm_section: input.farm_section ?? null,
      txn_date: input.txn_date,
      amount: input.amount,
      reference_number: input.reference_number ?? null,
      description: input.description ?? null,
      customer_id: input.customer_id ?? null,
      supplier_id: input.supplier_id ?? null,
      cash_account: input.cash_account ?? null,
      income_source: input.income_source ?? null,
      expense_type: input.expense_type ?? null,
      created_by: createdBy,
    },
  })
}

export async function deleteTransaction(id: string) {
  return runWrite({ label: 'Delete transaction', kind: 'delete', table: 'transactions', match: { id } })
}

/**
 * Purchases & Expenses ("disbursements") — each row pairs with its
 * auto-generated voucher. Vouchers are fetched in a second query and joined
 * client-side (the FK on vouchers.transaction_id is unique, so it's 1:1).
 */
export async function listDisbursements(
  type: 'purchase' | 'expense',
  filters: LedgerFilters = {},
): Promise<Disbursement[]> {
  const base = supabase.from('transactions').select(SELECT).eq('type', type)
  const query = applyLedgerFilters(base, filters, { date: 'txn_date', amount: 'amount' })
  const { data, error } = await query.order('txn_date', { ascending: false }).limit(500)
  if (error) throw toError(error)
  const rows = (data ?? []) as unknown as Transaction[]
  if (rows.length === 0) return []

  const { data: vouchers, error: vErr } = await supabase
    .from('vouchers')
    .select('*')
    .in('transaction_id', rows.map((r) => r.id))
  if (vErr) throw toError(vErr)
  const voucherByTx = new Map(
    ((vouchers ?? []) as Voucher[]).map((v) => [v.transaction_id, v]),
  )
  return rows.map((r) => ({ ...r, voucher: voucherByTx.get(r.id) ?? null }))
}

/**
 * Record a purchase/expense + its pending voucher in one atomic RPC (the
 * voucher number is assigned server-side, so offline-queued rows get theirs
 * when the queue flushes).
 */
export async function createDisbursement(
  type: 'purchase' | 'expense',
  input: DisbursementInput,
  createdBy: string | null,
) {
  return runWrite({
    label: `${labels.transactionType[type]} · ${input.amount}`,
    kind: 'rpc',
    fn: 'create_transaction_with_voucher',
    args: {
      p_type: type,
      p_branch: input.branch,
      p_txn_date: input.txn_date,
      p_amount: input.amount,
      p_farm_section: input.farm_section ?? null,
      p_reference_number: input.reference_number ?? null,
      p_description: input.description ?? null,
      p_supplier_id: input.supplier_id ?? null,
      p_cash_account: input.cash_account ?? null,
      p_expense_type: type === 'expense' ? (input.expense_type ?? null) : null,
      p_payee: input.payee ?? null,
      p_voucher_type: input.cash_account ? null : (input.voucher_type ?? null),
      p_created_by: createdBy,
    },
  })
}

/**
 * Edit a purchase/expense. Allowed while its voucher is pending — the DB
 * lock trigger rejects edits after approval/printing, and every change lands
 * in the audit trail; the pending voucher re-syncs via trigger.
 */
export async function updateDisbursement(id: string, type: 'purchase' | 'expense', input: DisbursementInput) {
  return runWrite({
    label: `Edit ${labels.transactionType[type].toLowerCase()}`,
    kind: 'update',
    table: 'transactions',
    values: {
      branch: input.branch,
      farm_section: input.farm_section ?? null,
      txn_date: input.txn_date,
      amount: input.amount,
      reference_number: input.reference_number ?? null,
      description: input.description ?? null,
      supplier_id: input.supplier_id ?? null,
      cash_account: input.cash_account ?? null,
      expense_type: type === 'expense' ? (input.expense_type ?? null) : null,
    },
    match: { id },
  })
}

/** Edit history of one transaction (who, when, field-by-field before/after). */
export async function getTransactionAudit(transactionId: string): Promise<TransactionAudit[]> {
  const { data, error } = await supabase
    .from('transaction_audit')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('edited_at', { ascending: false })
  if (error) throw toError(error)
  return (data ?? []) as TransactionAudit[]
}
