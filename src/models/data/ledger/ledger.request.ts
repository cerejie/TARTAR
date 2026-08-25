import { z } from "zod";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import { branchSlugSchema } from "../branch/branch.response";

export const receivableSchema = z
  .object({
    branch: branchSlugSchema,
    customer_id: z.string().uuid().nullable().optional(),
    customer_name: z.string().trim().max(160).nullable().optional(),
    amount: amountField,
    due_date: isoDateField,
    reference_number: z.string().trim().max(80).nullable().optional(),
  })
  .refine(
    (values) => !!values.customer_id || !!values.customer_name?.trim(),
    {
      path: ["customer_name"],
      message: "Select a customer or enter a name",
    }
  );

export type IReceivableInput = z.infer<typeof receivableSchema>;

export const payableSchema = z
  .object({
    branch: branchSlugSchema,
    supplier_id: z.string().uuid().nullable().optional(),
    supplier_name: z.string().trim().max(160).nullable().optional(),
    amount: amountField,
    due_date: isoDateField,
    reference_number: z.string().trim().max(80).nullable().optional(),
  })
  .refine(
    (values) => !!values.supplier_id || !!values.supplier_name?.trim(),
    {
      path: ["supplier_name"],
      message: "Select a supplier or enter a name",
    }
  );

export type IPayableInput = z.infer<typeof payableSchema>;

export const settlementSchema = z.object({ amount: amountField });

export type ISettlementInput = z.infer<typeof settlementSchema>;
