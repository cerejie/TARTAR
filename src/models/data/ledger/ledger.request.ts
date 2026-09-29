import { z } from "zod";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import {
  bankAccountRequiredIssue,
  hasBankAccountWhenBank,
  paymentAccountShape,
} from "../bank/bank.request";
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
});

export type IPayableInput = z.infer<typeof payableSchema>;

export const settlementSchema = z.object({ amount: amountField });

export type ISettlementInput = z.infer<typeof settlementSchema>;

export const markPaidSchema = z
  .object({
    paid_at: isoDateField,
    ...paymentAccountShape,
  })
  .refine((values) => !!values.cash_account, {
    path: ["cash_account"],
    message: "Choose where it was paid from",
  })
  .refine(hasBankAccountWhenBank, bankAccountRequiredIssue);

export type IMarkPaidInput = z.infer<typeof markPaidSchema>;
