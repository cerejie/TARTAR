import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import { applyLedgerFilters, type LedgerFilters } from './filters'
import { labels, type Transaction, type TransactionInput } from '../models'

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
