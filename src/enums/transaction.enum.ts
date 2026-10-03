import { z } from "zod";
import type { ISortOption } from "../models/common/table.model";
import type { StatusColor } from "../models/common/view.model";

export const transactionTypeValues = [
  "sale",
  "expense",
  "customer_payment",
  "supplier_payment",
  "cash_deposit",
  "petty_cash",
  "purchase",
] as const;
export const transactionTypeSchema = z.enum(transactionTypeValues);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const purchaseDateBasisValues = ["voucher", "paid"] as const;
export type PurchaseDateBasis = (typeof purchaseDateBasisValues)[number];

export const purchaseDateBasisLabels: Record<PurchaseDateBasis, string> = {
  voucher: "Voucher created",
  paid: "Paid",
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  sale: "Sale",
  expense: "Expense",
  customer_payment: "Customer Payment",
  supplier_payment: "Supplier Payment",
  cash_deposit: "Cash Deposit",
  petty_cash: "Petty Cash",
  purchase: "Purchase",
};

export const transactionTypeColors: Record<TransactionType, StatusColor> = {
  sale: "positive",
  expense: "negative",
  customer_payment: "default",
  supplier_payment: "default",
  cash_deposit: "default",
  petty_cash: "default",
  purchase: "default",
};

const isTransactionType = (type: string): type is TransactionType =>
  (transactionTypeValues as readonly string[]).includes(type);

export const transactionTypeLabelOf = (type: string): string =>
  isTransactionType(type) ? transactionTypeLabels[type] : "Other";

export const transactionTypeColorOf = (type: string): StatusColor =>
  isTransactionType(type) ? transactionTypeColors[type] : "default";

export const cashInflowTypes: TransactionType[] = [
  "sale",
  "customer_payment",
  "cash_deposit",
];

export const cashOutflowTypes: TransactionType[] = [
  "expense",
  "supplier_payment",
  "purchase",
  "petty_cash",
];

export const disbursementKindValues = ["purchase", "expense"] as const;
export type DisbursementKind = (typeof disbursementKindValues)[number];

export const cashAccountValues = [
  "cash_drawer",
  "petty_cash",
  "bank_account",
] as const;
export const cashAccountSchema = z.enum(cashAccountValues);
export type CashAccount = z.infer<typeof cashAccountSchema>;

export const cashAccountLabels: Record<CashAccount, string> = {
  cash_drawer: "Cash Drawer",
  petty_cash: "Petty Cash",
  bank_account: "Bank",
};

export const transactionSortOptions: readonly ISortOption[] = [
  { key: "newest", label: "Newest first", column: "txn_date", direction: "descending" },
  { key: "oldest", label: "Oldest first", column: "txn_date", direction: "ascending" },
  { key: "amount-high", label: "Amount: high to low", column: "amount", direction: "descending" },
  { key: "amount-low", label: "Amount: low to high", column: "amount", direction: "ascending" },
];
