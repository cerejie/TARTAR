import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import { applyLedgerFilters, type LedgerFilters } from './filters'
import type {
  LedgerStatus,
  Payable,
  PayableInput,
  Receivable,
  ReceivableInput,
} from '../models'

/**
 * Receivables (customers pay later) and Payables (bought on credit) — build
 * spec §9. Same lifecycle, so a factory keyed on the counterparty column serves
 * both. `paid_amount` + `amount` derive the open/partial/paid status.
 */
function deriveStatus(amount: number, paid: number): LedgerStatus {
  if (paid <= 0) return 'open'
  if (paid >= amount) return 'paid'
  return 'partial'
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
      const query = applyLedgerFilters(base, filters, { date: 'due_date', amount: 'amount' })
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

    /** Record a payment against a row, updating paid_amount + derived status. */
    settle: async (row: Row, payment: number) => {
      const paid = Number(row.paid_amount) + payment
      return runWrite({
        label: `Payment ${payment} on ${config.table.slice(0, -1)}`,
        kind: 'update',
        table: config.table,
        values: { paid_amount: paid, status: deriveStatus(Number(row.amount), paid) },
        match: { id: row.id },
      })
    },

    remove: async (id: string) => {
      return runWrite({ label: `Delete ${config.table.slice(0, -1)}`, kind: 'delete', table: config.table, match: { id } })
    },
  }
}

export const receivablesService = makeLedgerService<Receivable, ReceivableInput>({
  table: 'receivables',
  nameColumn: 'customer_name',
  idColumn: 'customer_id',
  getName: (i) => i.customer_name,
  getPartyId: (i) => i.customer_id,
})

export const payablesService = makeLedgerService<Payable, PayableInput>({
  table: 'payables',
  nameColumn: 'supplier_name',
  idColumn: 'supplier_id',
  getName: (i) => i.supplier_name,
  getPartyId: (i) => i.supplier_id,
})
