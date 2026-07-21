import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { Customer, CustomerLedgerKey, PartyInput, Supplier } from '../models'

/**
 * Customers and suppliers are the same master record with a different name, so
 * one factory builds both services (build spec §3 — no duplicated logic).
 * Writes go through `runWrite` so they queue while offline.
 */
const PARTY_COLS = 'id, name, contact, contact_person, address, created_at'

const toValues = (input: PartyInput) => ({
  name: input.name,
  contact: input.contact,
  contact_person: input.contact_person,
  address: input.address,
})

function makePartyService<Row extends Customer | Supplier>(table: 'customers' | 'suppliers') {
  const noun = table === 'customers' ? 'customer' : 'supplier'
  return {
    list: async (search?: string): Promise<Row[]> => {
      let query = supabase.from(table).select(PARTY_COLS)
      if (search) query = query.ilike('name', `%${search}%`)
      const { data, error } = await query.order('name', { ascending: true })
      if (error) throw toError(error)
      return (data ?? []) as unknown as Row[]
    },

    create: async (input: PartyInput) => {
      return runWrite({
        label: `New ${noun} "${input.name}"`,
        kind: 'insert',
        table,
        values: toValues(input),
      })
    },

    update: async (id: string, input: PartyInput) => {
      return runWrite({
        label: `Update ${noun} "${input.name}"`,
        kind: 'update',
        table,
        values: toValues(input),
        match: { id },
      })
    },

    remove: async (id: string) => {
      return runWrite({ label: `Delete ${noun}`, kind: 'delete', table, match: { id } })
    },
  }
}

export const customersService = {
  ...makePartyService<Customer>('customers'),

  /**
   * Save a customer's details from the Customer Ledger. Goes through the RPC
   * rather than a plain update because a receivable may name its customer as
   * free text: the RPC creates (or reuses) the master record and adopts that
   * name's existing receivables and payments in one transaction.
   */
  saveDetails: async (ledger: CustomerLedgerKey, input: PartyInput) => {
    return runWrite({
      label: `Customer details "${input.name}"`,
      kind: 'rpc',
      fn: 'save_customer_details',
      args: {
        p_customer_id: ledger.customerId,
        p_ledger_name: ledger.customerName,
        p_name: input.name,
        p_contact: input.contact,
        p_contact_person: input.contact_person,
        p_address: input.address,
      },
    })
  },
}

export const suppliersService = makePartyService<Supplier>('suppliers')
