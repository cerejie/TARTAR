import { z } from "zod";
import { transactionTypeSchema } from "../../../enums/transaction.enum";
import { voucherTypeSchema } from "../../../enums/voucher.enum";
import { amountField, isoDateField } from "../../../utils/schema.utils";
import {
  breakdownWithinInvoiceIssue,
  isBreakdownWithinInvoice,
  voucherBreakdownShape,
} from "../voucher/voucher.request";
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
import { expenseCategorySlugSchema } from "../expense-category/expense.category.response";
import { incomeSourceSlugSchema } from "../income-source/income.source.response";

export const transactionSchema = z
  .object({
    type: transactionTypeSchema,
    branch: branchSlugSchema,
    farm_section: farmSectionSlugSchema.nullable().optional(),
    txn_date: isoDateField,
    amount: amountField,
    reference_number: z.string().trim().max(80).nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
    supplier_id: z.string().uuid().nullable().optional(),
    customer_name: z.string().trim().max(160).nullable().optional(),
    supplier_name: z.string().trim().max(160).nullable().optional(),
    ...paymentAccountShape,
    income_source: incomeSourceSlugSchema.nullable().optional(),
    expense_type: expenseCategorySlugSchema.nullable().optional(),
  })
  .refine((values) => !values.farm_section || values.branch === FARM_BRANCH, {
    path: ["farm_section"],
    message: "Farm section only applies to the Farm branch",
  })
  .refine((values) => values.type !== "sale" || !!values.income_source, {
    path: ["income_source"],
    message: "Select an income source for a sale",
  })
  .refine((values) => values.type !== "expense" || !!values.expense_type, {
    path: ["expense_type"],
    message: "Select an expense type",
  })
  .refine(hasBankAccountWhenBank, bankAccountRequiredIssue);

export type ITransactionInput = z.infer<typeof transactionSchema>;

const disbursementBase = z.object({
  branch: branchSlugSchema,
  farm_section: farmSectionSlugSchema.nullable().optional(),
  txn_date: isoDateField,
  amount: amountField,
  due_date: isoDateField.nullable().optional(),
  ...paymentAccountShape,
  voucher_type: voucherTypeSchema.nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  payee: z.string().trim().max(160).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  ...voucherBreakdownShape,
});

const withDisbursementRules = <T extends typeof disbursementBase>(schema: T) =>
  schema
    .refine((values) => !values.farm_section || values.branch === FARM_BRANCH, {
      path: ["farm_section"],
      message: "Farm section only applies to the Farm branch",
    })
    .refine((values) => !!values.payee?.trim(), {
      path: ["payee"],
      message: "Select or type a supplier for the voucher",
    })
    .refine((values) => !!values.cash_account, {
      path: ["cash_account"],
      message: "Select where it is paid from",
    })
    .refine(hasBankAccountWhenBank, bankAccountRequiredIssue)
    .refine(isBreakdownWithinInvoice, breakdownWithinInvoiceIssue);

export const purchaseSchema = withDisbursementRules(disbursementBase);

export const expenseSchema = withDisbursementRules(
  disbursementBase.extend({
    expense_type: z
      .string()
      .trim()
      .min(2, "Select or type an expense type")
      .max(80),
  }) as unknown as typeof disbursementBase
);

export type IDisbursementInput = z.infer<typeof disbursementBase> & {
  expense_type?: string | null;
};
