import { z } from "zod";

export const transactionTypeValues = [
  "sale",
  "expense",
  "customer_payment",
  "supplier_payment",
  "cash_deposit",
  "petty_cash",
  "purchase",
  "collection",
] as const;
export const transactionTypeSchema = z.enum(transactionTypeValues);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const transactionTypeLabels: Record<TransactionType, string> = {
  sale: "Sale",
  expense: "Expense",
  customer_payment: "Customer Payment",
  supplier_payment: "Supplier Payment",
  cash_deposit: "Cash Deposit",
  petty_cash: "Petty Cash",
  purchase: "Purchase",
  collection: "Collection",
};

export const transactionTypeColors: Record<TransactionType, string> = {
  sale: "green",
  expense: "red",
  customer_payment: "default",
  supplier_payment: "default",
  cash_deposit: "default",
  petty_cash: "default",
  purchase: "default",
  collection: "default",
};

export const cashInflowTypes: TransactionType[] = [
  "sale",
  "customer_payment",
  "collection",
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

export const incomeSourceValues = ["product_sales", "rental_income"] as const;
export const incomeSourceSchema = z.enum(incomeSourceValues);
export type IncomeSource = z.infer<typeof incomeSourceSchema>;

export const incomeSourceLabels: Record<IncomeSource, string> = {
  product_sales: "Product Sales",
  rental_income: "Rental Income",
};

export const cashAccountValues = ["cash_drawer", "bank_account"] as const;
export const cashAccountSchema = z.enum(cashAccountValues);
export type CashAccount = z.infer<typeof cashAccountSchema>;

export const cashAccountLabels: Record<CashAccount, string> = {
  cash_drawer: "Cash Drawer",
  bank_account: "Bank Account",
};
