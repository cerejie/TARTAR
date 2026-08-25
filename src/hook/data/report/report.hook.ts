import {
  reportPayableKey,
  reportReceivableKey,
  reportTransactionKey,
  scopedKey,
} from "../../../keys/query.keys";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type {
  IPayable,
  IReceivable,
} from "../../../models/data/ledger/ledger.response";
import {
  reportTypeLabels,
  reportTypeValues,
  transactionReportTypes,
  type ReportType,
} from "../../../models/data/report/report.response";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import {
  payableServices,
  receivableServices,
} from "../../../services/data/ledger.services";
import transactionServices from "../../../services/data/transaction.services";
import { periodLabel, rangeFor, reportBody } from "../../../utils/report.utils";
import { printReport } from "../../../utils/print.utils";
import { useQuery } from "../../common/query.hook";
import { useSearchParam } from "../../common/search.param.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";

export const useReportHook = () => {
  const { value: type, setValue: setType } = useSearchParam<ReportType>(
    "type",
    reportTypeValues,
    "daily"
  );

  const { from, to } = rangeFor(type);
  const { branch, branchName } = useBranchScopeHook();
  const { expenseCategories } = useExpenseCategoryListHook();

  const branchFilter: ILedgerFilters = branch ? { branch } : {};
  const isTransactionReport = transactionReportTypes.includes(type);

  const transactionQuery = useQuery<ITransaction[]>(
    scopedKey(reportTransactionKey, type, branch),
    () =>
      transactionServices.getList({
        dateFrom: from,
        dateTo: to,
        ...branchFilter,
      }),
    { enabled: isTransactionReport }
  );

  const receivableQuery = useQuery<IReceivable[]>(
    scopedKey(reportReceivableKey, branch),
    () => receivableServices.getList(branchFilter),
    { enabled: type === "receivables" }
  );

  const payableQuery = useQuery<IPayable[]>(
    scopedKey(reportPayableKey, branch),
    () => payableServices.getList(branchFilter),
    { enabled: type === "payables" }
  );

  const transactions = transactionQuery.data ?? [];
  const receivables = receivableQuery.data ?? [];
  const payables = payableQuery.data ?? [];

  const loading =
    type === "receivables"
      ? receivableQuery.loading
      : type === "payables"
        ? payableQuery.loading
        : transactionQuery.loading;

  const print = () =>
    printReport({
      title: `${reportTypeLabels[type]} Report`,
      period: periodLabel(type, from, to),
      scope: branchName ?? "All branches",
      ...reportBody(type, {
        transactions,
        receivables,
        payables,
        categories: expenseCategories,
      }),
    });

  return {
    type,
    setType,
    branchName,
    transactions,
    receivables,
    payables,
    expenseCategories,
    loading,
    print,
  };
};
