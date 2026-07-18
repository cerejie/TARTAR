import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import { applyLedgerFilters, type LedgerFilters } from './filters'
import { todayIso } from '../utils/format'
import type {
  CustomerLedgerKey,
  CustomerReceivableSummary,
  LedgerStatus,
  Payable,
  PayableInput,
  Receivable,
  ReceivableInput,
} from '../models'

/**
 * Receivables (customers pay later) and Payables (bought on credit) — build
 * spec §9. Same lifecycle, so a factory keyed on the counterparty column serves
 * both. Settling now lives in payments.service (recordPayment) so every payment
 * is a verifiable record — there is deliberately no direct paid_amount write
 * here any more.
 */

/**
 * Status filter — 'overdue' is derived (unpaid + past due), so it can't go
 * through `applyLedgerFilters`. Both ledger tables share the same columns.
 */
function applyStatusFilter<T>(query: T, status: LedgerFilters['status']): T {
  if (!status) return query
  const q = query as {
    eq: (c: string, v: unknown) => unknown
    neq: (c: string, v: unknown) => unknown
    lt: (c: string, v: unknown) => unknown
  }
  if (status === 'overdue') {
    let next = q.neq('status', 'paid') as typeof q
    next = next.lt('due_date', todayIso()) as typeof q
    return next as T
  }
  return q.eq('status', status) as T
}

function makeLedgerService<
  Row extends { id: string; amount: number; paid_amount: number },
  Input extends { branch: string; amount: number; due_date: string; reference_number?: string | null },
>(config: {
  table: 'receivables' | 'payables'
  nameColumn: 'customer_name' | 'supplier_name'
  idColumn: 'customer_id' | 'supplier_id'
  getName: (input: Input) => string
  getPartyId: (input: Input) => string | null | undefined
}) {
  return {
    list: async (filters: LedgerFilters = {}): Promise<Row[]> => {
      const base = supabase.from(config.table).select('*')
      let query = applyLedgerFilters(base, filters, { date: 'due_date', amount: 'amount' })
      query = applyStatusFilter(query, filters.status)
      const { data, error } = await query.order('due_date', { ascending: true })
      if (error) throw toError(error)
      return (data ?? []) as unknown as Row[]
    },

    create: async (input: Input, createdBy: string | null) => {
      return runWrite({
        label: `New ${config.table.slice(0, -1)} · ${input.amount}`,
        kind: 'insert',
        table: config.table,
        values: {
          branch: input.branch,
          [config.idColumn]: config.getPartyId(input) ?? null,
          [config.nameColumn]: config.getName(input),
          amount: input.amount,
          due_date: input.due_date,
          reference_number: input.reference_number ?? null,
          status: 'open' as LedgerStatus,
          created_by: createdBy,
        },
      })
    },

    remove: async (id: string) => {
      return runWrite({ label: `Delete ${config.table.slice(0, -1)}`, kind: 'delete', table: config.table, match: { id } })
    },
  }
}

export const receivablesService = {
  ...makeLedgerService<Receivable, ReceivableInput>({
    table: 'receivables',
    nameColumn: 'customer_name',
    idColumn: 'customer_id',
    getName: (i) => i.customer_name,
    getPartyId: (i) => i.customer_id,
  }),

  /**
   * Customer Ledger — every customer that has receivable rows, with computed
   * outstanding balance (never stored). Rows without a linked `customer_id`
   * group by their free-typed name.
   */
  getCustomersWithReceivables: async (): Promise<CustomerReceivableSummary[]> => {
    const { data, error } = await supabase
      .from('receivables')
      .select('customer_id, customer_name, amount, paid_amount, status, created_at')
    if (error) throw toError(error)
    const byKey = new Map<string, CustomerReceivableSummary>()
    for (const r of data ?? []) {
      const key = r.customer_id ?? `name:${r.customer_name}`
      const entry = byKey.get(key) ?? {
        customerId: r.customer_id,
        customerName: r.customer_name,
        outstanding: 0,
        unpaidCount: 0,
        lastTransactionAt: null,
      }
      entry.outstanding += Number(r.amount) - Number(r.paid_amount)
      if (r.status !== 'paid') entry.unpaidCount += 1
      if (!entry.lastTransactionAt || r.created_at > entry.lastTransactionAt) {
        entry.lastTransactionAt = r.created_at
      }
      byKey.set(key, entry)
    }
    return [...byKey.values()].sort((a, b) => a.customerName.localeCompare(b.customerName))
  },

  /** All receivables of one customer, honoring the shared search filters. */
  getCustomerLedger: async (
    customer: CustomerLedgerKey,
    filters: LedgerFilters = {},
  ): Promise<Receivable[]> => {
    const base = supabase.from('receivables').select('*')
    // Match on the saved customer when linked; free-typed rows match by name.
    const scoped = customer.customerId
      ? base.eq('customer_id', customer.customerId)
      : base.is('customer_id', null).eq('customer_name', customer.customerName)
    let query = applyLedgerFilters(scoped, filters, { date: 'due_date', amount: 'amount' })
    query = applyStatusFilter(query, filters.status)
    const { data, error } = await query.order('due_date', { ascending: true })
    if (error) throw toError(error)
    return (data ?? []) as Receivable[]
  },

  /**
   * Most recent payment transaction for a customer (customer_payment or
   * collection). Only derivable for saved customers — settlements themselves
   * don't record a date, so this is best-effort ("if available").
   */
  getCustomerLastPayment: async (customerId: string | null): Promise<string | null> => {
    if (!customerId) return null
    const { data, error } = await supabase
      .from('transactions')
      .select('txn_date')
      .eq('customer_id', customerId)
      .in('type', ['customer_payment', 'collection'])
      .order('txn_date', { ascending: false })
      .limit(1)
    if (error) throw toError(error)
    return data?.[0]?.txn_date ?? null
  },
}

export const payablesService = makeLedgerService<Payable, PayableInput>({
  table: 'payables',
  nameColumn: 'supplier_name',
  idColumn: 'supplier_id',
  getName: (i) => i.supplier_name,
  getPartyId: (i) => i.supplier_id,
})
