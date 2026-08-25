import type { IPayable, IReceivable } from "../ledger/ledger.response";

export interface IDashboardSummary {
  currentCash: number;
  bankBalance: number;
  todaysSales: number;
  todaysExpenses: number;
  yesterdaysSales: number;
  yesterdaysExpenses: number;
  accountsReceivable: number;
  accountsPayable: number;
  monthlySales: number;
  monthlyExpenses: number;
  lastMonthSales: number;
  lastMonthExpenses: number;
  monthlyCashIn: number;
  monthlyCashOut: number;
}

export interface IDailySalesPoint {
  date: string;
  total: number;
}

export const salesPeriodValues = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;
export type SalesPeriod = (typeof salesPeriodValues)[number];

export const salesPeriodLabels: Record<SalesPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const salesPeriodSubtitles: Record<SalesPeriod, string> = {
  daily: "Last 30 days",
  weekly: "Last 12 weeks",
  monthly: "Last 12 months",
  yearly: "Last 5 years",
};

export interface IBranchMonitorRow {
  branch: string;
  branchName: string;
  cashBalance: number;
  sales: number;
  expenses: number;
  receivables: number;
  payables: number;
}

export interface IDueAlerts {
  overdueReceivables: IReceivable[];
  overduePayables: IPayable[];
  nearDueReceivables: IReceivable[];
  nearDuePayables: IPayable[];
}
