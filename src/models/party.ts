import { z } from 'zod'

/**
 * "Parties" = customers and suppliers. Identical shape, so one model with a
 * shared schema keeps the two services and forms DRY (build spec §3).
 */
export interface Party {
  id: string
  name: string
  contact: string | null
  created_at: string
}

export type Customer = Party
export type Supplier = Party

export const partySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  contact: z.string().trim().max(120).nullable().optional(),
})
export type PartyInput = z.infer<typeof partySchema>
