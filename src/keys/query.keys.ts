import type { DisbursementKind } from "../enums/transaction.enum";

export const branchListKey = "branches";
export const branchAdminListKey = "branches-admin";
export const branchMonitorKey = "branch-monitor";
export const farmSectionListKey = "farm-sections";
export const expenseCategoryListKey = "expense-categories";
export const incomeSourceListKey = "income-sources";
export const bankListKey = "banks";
export const bankAccountListKey = "bank-accounts";
export const customerListKey = "customers";
export const supplierListKey = "suppliers";
export const userListKey = "users";
export const userDisplayNamesKey = "user-display-names";
export const transactionListKey = "transactions";
export const transactionSummaryKey = "transaction-summary";
export const purchaseListKey = "purchases";
export const purchaseSummaryKey = "purchase-summary";
export const saleListKey = "sales";
export const saleSummaryKey = "sale-summary";
export const expenseListKey = "expenses";
export const expenseSummaryKey = "expense-summary";
export const voucherListKey = "vouchers";
export const disbursementDetailKey = "disbursement-detail";
export const receivableListKey = "receivables";
export const payableListKey = "payables";
export const paymentListKey = "payments";
export const ledgerSummaryKey = "ledger-summary";
export const ledgerPartyKey = "ledger-parties";
export const dashboardSummaryKey = "dashboard-summary";
export const dashboardSalesKey = "dashboard-sales";
export const dashboardAlertsKey = "dashboard-alerts";
export const dashboardOverviewKey = "dashboard-overview";
export const dashboardChecksKey = "dashboard-checks";
export const dashboardProfitKey = "dashboard-profit";
export const dashboardReviewsKey = "dashboard-reviews";
export const reportTransactionKey = "report-transactions";
export const reportReceivableKey = "report-receivables";
export const reportPayableKey = "report-payables";
export const reportSummaryKey = "report-summary";
export const inboxListKey = "inbox";

export const scopedKey = (...parts: (string | number | null | undefined)[]) =>
  parts.map((part) => part ?? "all").join(":");

export const isKeyUnder = (key: string, keyPrefix: string): boolean =>
  key === keyPrefix || key.startsWith(`${keyPrefix}:`);

export const liveRefreshKeys: readonly string[] = [
  transactionListKey,
  transactionSummaryKey,
  purchaseListKey,
  purchaseSummaryKey,
  saleListKey,
  saleSummaryKey,
  expenseListKey,
  expenseSummaryKey,
  voucherListKey,
  branchMonitorKey,
  dashboardSummaryKey,
  dashboardSalesKey,
  dashboardOverviewKey,
  reportTransactionKey,
  reportSummaryKey,
  dashboardAlertsKey,
  dashboardChecksKey,
  dashboardProfitKey,
  dashboardReviewsKey,
  receivableListKey,
  payableListKey,
  paymentListKey,
  ledgerSummaryKey,
  ledgerPartyKey,
  inboxListKey,
];

export const disbursementScopeOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseListKey : expenseListKey;

export const disbursementSummaryKeyOf = (kind: DisbursementKind) =>
  kind === "purchase" ? purchaseSummaryKey : expenseSummaryKey;
