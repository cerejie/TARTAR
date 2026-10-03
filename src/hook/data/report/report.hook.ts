import {
  reportPayableKey,
  reportReceivableKey,
  reportTransactionKey,
  scopedKey,
} from "../../../keys/query.keys";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type {
  ILedgerRow,
  IPayable,
  IReceivable,
} from "../../../models/data/ledger/ledger.response";
import {
  reportTypeLabels,
  reportTypeValues,
  transactionReportTypes,
  type ReportType,
} from "../../../models/data/report/report.response";
import type { IDisbursement } from "../../../models/data/transaction/transaction.response";
import {
  payableServices,
  receivableServices,
} from "../../../services/data/ledger.services";
import transactionServices from "../../../services/data/transaction.services";
import { periodLabel, rangeFor, reportBody } from "../../../utils/report.utils";
import { printReport } from "../../../utils/print.utils";
import { useQuery } from "../../common/query.hook";
import { useSearchParam } from "../../common/search.param.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";
import { useReportSummaryHook } from "./report.summary.hook";

const isUnpaid = (row: ILedgerRow) => row.status !== "paid";

const branchFilterOf = (branch: string | null): ILedgerFilters =>
  branch ? { branch } : {};

export const reportTransactionQueryOf = (
  type: ReportType,
  branch: string | null
): IQuerySpec<IDisbursement[]> => [
  scopedKey(reportTransactionKey, type, branch),
  () => {
    const { from, to } = rangeFor(type);
    return transactionServices.getAllWithVouchers({
      dateFrom: from,
      dateTo: to,
      ...branchFilterOf(branch),
    });
  },
];

export const reportReceivableQueryOf = (
  branch: string | null
): IQuerySpec<IReceivable[]> => [
  scopedKey(reportReceivableKey, branch),
  () => receivableServices.getAll(branchFilterOf(branch)),
];

export const reportPayableQueryOf = (
  branch: string | null
): IQuerySpec<IPayable[]> => [
  scopedKey(reportPayableKey, branch),
  () => payableServices.getAll(branchFilterOf(branch)),
];

export const useReportHook = () => {
  const { value: type, setValue: setType } = useSearchParam<ReportType>(
    "type",
    reportTypeValues,
    "summary"
  );

  const { from, to } = rangeFor(type);
  const { branch, branchName } = useBranchScopeHook();
  const { branchName: branchNameOf } = useBranchListHook();
  const { expenseCategories } = useExpenseCategoryListHook();
  const isSummary = type === "summary";
  const {
    summaryLoading,
    summaryRefreshing,
    summaryError,
    retrySummary,
    printSummary,
    ...summary
  } = useReportSummaryHook(isSummary);

  const isTransactionReport = transactionReportTypes.includes(type);

  const transactionQuery = useQuery(...reportTransactionQueryOf(type, branch), {
    enabled: isTransactionReport,
  });

  const receivableQuery = useQuery(...reportReceivableQueryOf(branch), {
    enabled: type === "receivables",
  });

  const payableQuery = useQuery(...reportPayableQueryOf(branch), {
    enabled: type === "payables",
  });

  const transactions = transactionQuery.data ?? [];
  const receivables = (receivableQuery.data ?? []).filter(isUnpaid);
  const payables = (payableQuery.data ?? []).filter(isUnpaid);

  const activeQuery =
    type === "receivables"
      ? receivableQuery
      : type === "payables"
        ? payableQuery
        : transactionQuery;

  const printActiveReport = () =>
    printReport({
      title: `${reportTypeLabels[type]} Report`,
      period: periodLabel(type, from, to),
      scope: branchName ?? "All branches",
      ...reportBody(type, {
        transactions,
        receivables,
        payables,
        categories: expenseCategories,
        branchNameOf,
      }),
    });

  return {
    type,
    setType,
    branchName,
    period: isSummary ? undefined : periodLabel(type, from, to),
    transactions,
    receivables,
    payables,
    expenseCategories,
    branchNameOf,
    ...summary,
    loading: isSummary ? summaryLoading : activeQuery.isInitialLoading,
    refreshing: isSummary ? summaryRefreshing : activeQuery.isRefreshing,
    error: isSummary ? summaryError : activeQuery.error,
    retry: isSummary ? retrySummary : activeQuery.refetch,
    print: isSummary ? printSummary : printActiveReport,
  };
};
