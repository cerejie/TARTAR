import type { TransactionType } from "../../../enums/transaction.enum";
import type { IExpenseCategory } from "../expense-category/expense.category.response";
import type { IPayable, IReceivable } from "../ledger/ledger.response";
import type {
  IDisbursement,
  ITransaction,
} from "../transaction/transaction.response";

export const reportTypeValues = [
  "summary",
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
  summary: "Branch Summary",
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

export interface IBranchSummaryTotals {
  sales: number;
  pendingSales: number;
  expenses: number;
  purchases: number;
  net: number;
}

export interface IBranchSummaryRow extends IBranchSummaryTotals {
  branch: string;
  branchName: string;
}

export interface IBranchSummaryData {
  sales: ITransaction[];
  purchases: IDisbursement[];
  expenses: IDisbursement[];
}

export interface IReportData {
  transactions: ITransaction[];
  receivables: IReceivable[];
  payables: IPayable[];
  categories: IExpenseCategory[];
}

export interface IReportState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
}
