import { z } from 'zod'

/**
 * "Parties" = customers and suppliers. Both are master records with the same
 * shape — name plus contact details — so one model keeps the service and the
 * forms DRY (build spec §3). Suppliers gained the detail fields on 2026-07-21,
 * customers on 2026-07-22 (their details are filled from the Customer Ledger).
 */
export interface Party {
  id: string
  name: string
  contact: string | null
  contact_person: string | null
  address: string | null
  created_at: string
}

export type Customer = Party
export type Supplier = Party

/** Optional free-text detail: '' from an untouched input means "not set". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null)

export const partySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  contact: optionalText(120),
  contact_person: optionalText(160),
  address: optionalText(400),
})
export type PartyInput = z.infer<typeof partySchema>

/** How much of a party's details are filled in — drives the ledger's
 *  "information complete?" indicator. 'none' = nothing on file yet, whether or
 *  not a master record exists. */
export type PartyInfoState = 'complete' | 'partial' | 'none'

export function partyInfoState(party: Party | null | undefined): PartyInfoState {
  if (!party) return 'none'
  const details = [party.contact, party.contact_person, party.address]
  if (details.every((d) => !!d)) return 'complete'
  return details.some((d) => !!d) ? 'partial' : 'none'
}
