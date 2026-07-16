import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { Party, PartyInput } from '../models'

/**
 * Customers and suppliers share an identical shape, so one factory builds both
 * services (build spec §3 — no duplicated logic). Writes go through `runWrite`
 * so they queue while offline.
 */
function makePartyService(table: 'customers' | 'suppliers') {
  return {
    list: async (search?: string): Promise<Party[]> => {
      let query = supabase.from(table).select('id, name, contact, created_at')
      if (search) query = query.ilike('name', `%${search}%`)
      const { data, error } = await query.order('name', { ascending: true })
      if (error) throw toError(error)
      return (data ?? []) as Party[]
    },

    create: async (input: PartyInput) => {
      return runWrite({
        label: `New ${table === 'customers' ? 'customer' : 'supplier'} "${input.name}"`,
        kind: 'insert',
        table,
        values: { name: input.name, contact: input.contact ?? null },
      })
    },

    update: async (id: string, input: PartyInput) => {
      return runWrite({
        label: `Update ${table} "${input.name}"`,
        kind: 'update',
        table,
        values: { name: input.name, contact: input.contact ?? null },
        match: { id },
      })
    },

    remove: async (id: string) => {
      return runWrite({ label: `Delete from ${table}`, kind: 'delete', table, match: { id } })
    },
  }
}

export const customersService = makePartyService('customers')
export const suppliersService = makePartyService('suppliers')
