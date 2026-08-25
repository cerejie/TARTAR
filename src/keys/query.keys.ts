export const branchListKey = "branches";
export const branchAdminListKey = "branches-admin";
export const branchMonitorKey = "branch-monitor";
export const farmSectionListKey = "farm-sections";
export const expenseCategoryListKey = "expense-categories";
export const customerListKey = "customers";
export const supplierListKey = "suppliers";
export const userListKey = "users";
export const transactionListKey = "transactions";
export const purchaseListKey = "purchases";
export const expenseListKey = "expenses";
export const voucherListKey = "vouchers";
export const receivableListKey = "receivables";
export const payableListKey = "payables";
export const paymentListKey = "payments";
export const dashboardSummaryKey = "dashboard-summary";
export const dashboardSalesKey = "dashboard-sales";
export const dashboardAlertsKey = "dashboard-alerts";
export const reportTransactionKey = "report-transactions";
export const reportReceivableKey = "report-receivables";
export const reportPayableKey = "report-payables";

export const scopedKey = (...parts: (string | number | null | undefined)[]) =>
  parts.map((part) => part ?? "all").join(":");
