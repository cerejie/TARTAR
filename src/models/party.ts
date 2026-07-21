import { z } from 'zod'

/**
 * "Parties" = customers and suppliers. They share the same core shape, so one
 * base model keeps the two services and forms DRY (build spec §3). Suppliers
 * additionally carry the master-record details managed on the Master Data
 * screen (client decision 2026-07-21).
 */
export interface Party {
  id: string
  name: string
  contact: string | null
  created_at: string
}

export type Customer = Party

export interface Supplier extends Party {
  contact_person: string | null
  address: string | null
}

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
})
export type PartyInput = z.infer<typeof partySchema>

export const supplierSchema = partySchema.extend({
  contact_person: optionalText(160),
  address: optionalText(400),
})
export type SupplierInput = z.infer<typeof supplierSchema>
