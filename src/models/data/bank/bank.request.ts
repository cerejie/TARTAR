import { z } from "zod";
import { cashAccountSchema } from "../../../enums/transaction.enum";
import { sortField } from "../../../utils/schema.utils";
import type { CashAccount } from "../../../enums/transaction.enum";

export const bankAccountSchema = z.object({
  bank_name: z.string().trim().min(2, "Enter the bank name").max(80),
  account_name: z.string().trim().min(2, "Enter the account name").max(120),
  account_number: z.string().trim().min(4, "Enter the account number").max(40),
  sort: sortField,
});

export type IBankAccountInput = z.infer<typeof bankAccountSchema>;

export const paymentAccountShape = {
  cash_account: cashAccountSchema.nullable().optional(),
  bank_id: z.string().uuid().nullable().optional(),
  bank_account_id: z.string().uuid().nullable().optional(),
};

export type IPaymentAccountInput = {
  cash_account?: CashAccount | null;
  bank_id?: string | null;
  bank_account_id?: string | null;
};

export const hasBankAccountWhenBank = (values: IPaymentAccountInput) =>
  values.cash_account !== "bank_account" || !!values.bank_account_id;

export const bankAccountRequiredIssue = {
  path: ["bank_account_id"],
  message: "Select the bank account",
};

export const bankAccountOf = (values: IPaymentAccountInput) =>
  values.cash_account === "bank_account" ? values.bank_account_id ?? null : null;
