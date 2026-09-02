export const transactionPaginationKey = "transactions-table";
export const voucherPaginationKey = "vouchers-table";
export const userPaginationKey = "users-table";
export const paymentPaginationKey = (kind: string) => `${kind}-payments-table`;
export const ledgerPaginationKey = (scope: string) => `${scope}-table`;
export const disbursementPaginationKey = (scope: string) => `${scope}-table`;

export const transactionExpansionKey = "transactions-table-rows";
