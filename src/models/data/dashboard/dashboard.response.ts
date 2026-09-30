import type { CashAccount } from "../../../enums/transaction.enum";
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
  monthlyPendingSales: number;
  monthlyCashIn: number;
  monthlyCashOut: number;
}

export interface IDashboardProfit {
  current: number;
  previous: number;
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

export const salesAxisFormats: Record<SalesPeriod, string> = {
  daily: "MMM D",
  weekly: "MMM D",
  monthly: "MMM",
  yearly: "YYYY",
};

export const overviewPeriodValues = [
  "all",
  "daily",
  "weekly",
  "monthly",
] as const;
export type OverviewPeriod = (typeof overviewPeriodValues)[number];

export const overviewPeriodLabels: Record<OverviewPeriod, string> = {
  all: "All time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const overviewPeriodCaptions: Record<OverviewPeriod, string> = {
  all: "all time",
  daily: "today",
  weekly: "this week",
  monthly: "this month",
};

export const overviewSalesPeriods: Record<OverviewPeriod, SalesPeriod> = {
  all: "yearly",
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
};

export interface IDashboardOverview {
  sales: number;
  expenses: number;
  arOutstanding: number;
  arNew: number;
  apOutstanding: number;
  apNew: number;
}

export interface IBranchMonitorRow {
  branch: string;
  branchName: string;
  cashBalance: number;
  sales: number;
  expenses: number;
  receivables: number;
  payables: number;
}

export type DuePayableSource = "purchase" | "expense";

export interface IPaymentAccountRef {
  cash_account: CashAccount | null;
  bank_account_id: string | null;
}

export interface IDuePayable extends IPayable {
  source: DuePayableSource | null;
  payment: IPaymentAccountRef | null;
  check_bank: string | null;
}

export interface IDueAlerts {
  overdueReceivables: IReceivable[];
  overduePayables: IDuePayable[];
  nearDueReceivables: IReceivable[];
  nearDuePayables: IDuePayable[];
}

export const dueAlertCount = (alerts: IDueAlerts): number =>
  alerts.overdueReceivables.length +
  alerts.overduePayables.length +
  alerts.nearDueReceivables.length +
  alerts.nearDuePayables.length;

export type NotificationKind = "receivable" | "payable" | DuePayableSource;

export type NotificationLedger = "receivable" | "payable";

export type NotificationTone = "negative" | "warning";

export interface INotificationRow {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  kind: NotificationKind;
  ledger: NotificationLedger;
  partyId: string | null;
  payment: IPaymentAccountRef | null;
  checkBank: string | null;
}

export interface INotificationGroup {
  key: string;
  label: string;
  variant: NotificationTone;
  rows: INotificationRow[];
  describe: (row: INotificationRow) => string;
}

export const notificationKindLabels: Record<NotificationKind, string> = {
  receivable: "Receivable",
  payable: "Payable",
  purchase: "Purchase",
  expense: "Expense",
};

export const notificationKindPaths: Record<NotificationLedger, string> = {
  receivable: "/receivables",
  payable: "/payables",
};

export interface IAttentionItem {
  key: string;
  name: string;
  count: number;
  amount: number;
  tone: NotificationTone;
  path: string;
}
