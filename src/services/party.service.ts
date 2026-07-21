import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { Customer, Party, PartyInput, Supplier, SupplierInput } from '../models'

/**
 * Customers and suppliers share the same lifecycle, so one factory builds both
 * services (build spec §3 — no duplicated logic); only the selected columns and
 * the written values differ, since a supplier master record carries extra
 * detail. Writes go through `runWrite` so they queue while offline.
 */
function makePartyService<Row extends Party, Input extends PartyInput>(
  table: 'customers' | 'suppliers',
  columns: string,
  toValues: (input: Input) => Record<string, unknown>,
) {
  const noun = table === 'customers' ? 'customer' : 'supplier'
  return {
    list: async (search?: string): Promise<Row[]> => {
      let query = supabase.from(table).select(columns)
      if (search) query = query.ilike('name', `%${search}%`)
      const { data, error } = await query.order('name', { ascending: true })
      if (error) throw toError(error)
      return (data ?? []) as unknown as Row[]
    },

    create: async (input: Input) => {
      return runWrite({
        label: `New ${noun} "${input.name}"`,
        kind: 'insert',
        table,
        values: toValues(input),
      })
    },

    update: async (id: string, input: Input) => {
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

const PARTY_COLS = 'id, name, contact, created_at'

export const customersService = makePartyService<Customer, PartyInput>(
  'customers',
  PARTY_COLS,
  (input) => ({ name: input.name, contact: input.contact }),
)

export const suppliersService = makePartyService<Supplier, SupplierInput>(
  'suppliers',
  `${PARTY_COLS}, contact_person, address`,
  (input) => ({
    name: input.name,
    contact: input.contact,
    contact_person: input.contact_person,
    address: input.address,
  }),
)
