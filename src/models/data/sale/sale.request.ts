import { z } from "zod";
import { todayIso } from "../../../utils/format.utils";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import {
  bankAccountRequiredIssue,
  hasBankAccountWhenBank,
  paymentAccountShape,
} from "../bank/bank.request";
import {
  FARM_BRANCH,
  branchSlugSchema,
  farmSectionSlugSchema,
} from "../branch/branch.response";
import { incomeSourceSlugSchema } from "../income-source/income.source.response";

export const saleSchema = z
  .object({
    branch: branchSlugSchema,
    farm_section: farmSectionSlugSchema.nullable().optional(),
    txn_date: isoDateField,
    amount: amountField,
    income_source: incomeSourceSlugSchema,
    ...paymentAccountShape,
    customer_id: z.string().uuid().nullable().optional(),
    reference_number: z.string().trim().max(80).nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .refine((values) => !values.farm_section || values.branch === FARM_BRANCH, {
    path: ["farm_section"],
    message: "Farm section only applies to the Farm branch",
  })
  .refine(hasBankAccountWhenBank, bankAccountRequiredIssue);

export type ISaleInput = z.infer<typeof saleSchema>;

export const saleDepositSchema = z.object({
  deposit_date: isoDateField.refine((value) => value <= todayIso(), {
    message: "The deposit date cannot be in the future",
  }),
});

export type ISaleDepositInput = z.infer<typeof saleDepositSchema>;

export const saleRejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Enter the reason for rejecting this sale")
    .max(500),
});

export type ISaleRejectInput = z.infer<typeof saleRejectSchema>;
