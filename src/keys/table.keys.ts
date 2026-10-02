export const transactionPaginationKey = "transactions-table";
export const transactionSortKey = "transactions-sort";
export const salePaginationKey = "sales-table";
export const saleSortKey = "sales-sort";
export const saleExpansionKey = "sales-table-rows";
export const voucherPaginationKey = "vouchers-table";
export const voucherSortKey = "vouchers-sort";
export const voucherExpansionKey = "vouchers-table-rows";
export const userPaginationKey = "users-table";
export const paymentPaginationKey = (kind: string) => `${kind}-payments-table`;
export const ledgerPaginationKey = (scope: string) => `${scope}-table`;
export const disbursementPaginationKey = (scope: string) => `${scope}-table`;

export const transactionExpansionKey = "transactions-table-rows";
export const branchMonitorExpansionKey = "branch-monitor-table-rows";
export const disbursementExpansionKey = (scope: string) => `${scope}-table-rows`;
export const ledgerExpansionKey = (scope: string) => `${scope}-table-rows`;

export const disbursementSortKey = (scope: string) => `${scope}-sort`;
export const ledgerSortKey = (scope: string) => `${scope}-sort`;
export const paymentSortKey = (kind: string) => `${kind}-payments-sort`;

export const rowFocusParamKey = "focus";
