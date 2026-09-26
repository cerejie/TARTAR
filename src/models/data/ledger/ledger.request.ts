import { z } from "zod";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import { branchSlugSchema } from "../branch/branch.response";

export const receivableSchema = z.object({
  branch: branchSlugSchema,
  customer_id: z.string().uuid().nullable().optional(),
  customer_name: z
    .string()
    .trim()
    .min(1, "Select or enter a customer")
    .max(160),
  amount: amountField,
  due_date: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
});

export type IReceivableInput = z.infer<typeof receivableSchema>;

export const payableSchema = z.object({
  branch: branchSlugSchema,
  supplier_id: z.string().uuid().nullable().optional(),
  supplier_name: z
    .string()
    .trim()
    .min(1, "Select or enter a supplier")
    .max(160),
  amount: amountField,
  due_date: isoDateField,
  reference_number: z.string().trim().max(80).nullable().optional(),
});

export type IPayableInput = z.infer<typeof payableSchema>;

export const settlementSchema = z.object({ amount: amountField });

export type ISettlementInput = z.infer<typeof settlementSchema>;
