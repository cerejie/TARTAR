import type { TransactionType } from "../../../enums/transaction.enum";
import type { IExpenseCategory } from "../expense-category/expense.category.response";
import type { IPayable, IReceivable } from "../ledger/ledger.response";
import type { ITransaction } from "../transaction/transaction.response";

export const reportTypeValues = [
  "daily",
  "weekly",
  "monthly",
  "cashflow",
  "receivables",
  "payables",
  "expenses",
] as const;

export type ReportType = (typeof reportTypeValues)[number];

export const reportTypeLabels: Record<ReportType, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  cashflow: "Cash Flow",
  receivables: "Receivables",
  payables: "Payables",
  expenses: "Expenses",
};

export const transactionReportTypes: ReportType[] = [
  "daily",
  "weekly",
  "monthly",
  "cashflow",
  "expenses",
];

export interface ICashFlowRow {
  key: TransactionType;
  label: string;
  direction: string;
  total: number;
}

export interface IExpenseRow {
  key: string;
  label: string;
  active: boolean;
  total: number;
}

export interface IReportData {
  transactions: ITransaction[];
  receivables: IReceivable[];
  payables: IPayable[];
  categories: IExpenseCategory[];
}
