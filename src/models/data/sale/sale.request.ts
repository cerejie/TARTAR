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

const saleShape = z.object({
  branch: branchSlugSchema,
  farm_section: farmSectionSlugSchema.nullable().optional(),
  txn_date: isoDateField,
  amount: amountField,
  income_source: incomeSourceSlugSchema,
  ...paymentAccountShape,
  customer_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().trim().max(160).nullable().optional(),
  reference_number: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
});

const farmSectionOnFarm = (values: z.infer<typeof saleShape>) =>
  !values.farm_section || values.branch === FARM_BRANCH;

const farmSectionIssue = {
  path: ["farm_section"],
  message: "Farm section only applies to the Farm branch",
};

const depositDateField = isoDateField.refine((value) => value <= todayIso(), {
  message: "The deposit date cannot be in the future",
});

export const saleSchema = saleShape
  .refine(farmSectionOnFarm, farmSectionIssue)
  .refine(hasBankAccountWhenBank, bankAccountRequiredIssue);

export type ISaleInput = z.infer<typeof saleSchema>;

export const saleDepositSchema = z.object({
  deposit_date: depositDateField,
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

export const saleResubmitSchema = saleShape
  .extend({ deposit_date: depositDateField })
  .refine(farmSectionOnFarm, farmSectionIssue)
  .refine(hasBankAccountWhenBank, bankAccountRequiredIssue)
  .refine((values) => values.deposit_date >= values.txn_date, {
    path: ["deposit_date"],
    message: "The deposit date cannot be before the sale date",
  });

export type ISaleResubmitInput = z.infer<typeof saleResubmitSchema>;
