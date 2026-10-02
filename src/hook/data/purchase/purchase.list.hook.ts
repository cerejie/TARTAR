import {
  countedAmountOf,
  isCountedDisbursement,
  type IDisbursement,
  type IPurchaseSummary,
} from "../../../models/data/transaction/transaction.response";
import {
  pendingVoucherCount,
  sumDisbursements,
  useDisbursementListHook,
} from "../disbursement/disbursement.list.hook";

const paidAmountOf = (row: IDisbursement) => {
  if (!row.due_date) return countedAmountOf(row);
  return row.payable ? Number(row.payable.paid_amount) : 0;
};

const outstandingAmountOf = (row: IDisbursement) =>
  countedAmountOf(row) - paidAmountOf(row);

const sumOf = (
  rows: readonly IDisbursement[],
  amountOf: (row: IDisbursement) => number
) => rows.reduce((total, row) => total + amountOf(row), 0);

const summarize = (rows: readonly IDisbursement[]): IPurchaseSummary => {
  const counted = rows.filter(isCountedDisbursement);

  return {
    total: sumDisbursements(counted),
    outstanding: sumOf(counted, outstandingAmountOf),
    paid: sumOf(counted, paidAmountOf),
    pendingVouchers: pendingVoucherCount(rows),
  };
};

export const usePurchaseListHook = () => {
  const disbursement = useDisbursementListHook("purchase", "Purchase");

  return {
    ...disbursement,
    summary: summarize(disbursement.summaryRows),
  };
};
