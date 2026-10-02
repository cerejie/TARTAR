import {
  countedAmountOf,
  type IDisbursement,
  type IExpenseCategoryTotal,
  type IExpenseSummary,
} from "../../../models/data/transaction/transaction.response";
import {
  pendingVoucherCount,
  sumDisbursements,
  useDisbursementListHook,
} from "../disbursement/disbursement.list.hook";

const topCategoryOf = (
  rows: readonly IDisbursement[],
  labelOf: (slug: string | null | undefined) => string
): IExpenseCategoryTotal | null => {
  const totalBySlug = new Map<string, number>();

  for (const row of rows) {
    const slug = row.expense_type ?? "";
    totalBySlug.set(slug, (totalBySlug.get(slug) ?? 0) + countedAmountOf(row));
  }

  let top: IExpenseCategoryTotal | null = null;

  for (const [slug, amount] of totalBySlug) {
    if (!top || amount > top.amount) top = { label: labelOf(slug), amount };
  }

  return top;
};

const summarize = (
  rows: readonly IDisbursement[],
  labelOf: (slug: string | null | undefined) => string
): IExpenseSummary => ({
  total: sumDisbursements(rows),
  topCategory: topCategoryOf(rows, labelOf),
  records: rows.length,
  pendingVouchers: pendingVoucherCount(rows),
});

export const useExpenseListHook = () => {
  const disbursement = useDisbursementListHook("expense", "Expense");

  return {
    ...disbursement,
    summary: summarize(disbursement.summaryRows, disbursement.expenseCategoryLabelOf),
  };
};
