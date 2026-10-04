import {
  reportPayableKey,
  reportPaymentKey,
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
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";
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
import paymentServices from "../../../services/data/payment.services";
import {
  datasetFiltersOf,
  datasetSourcesOf,
  derivedRows,
  withOfflineDerive,
} from "../../../utils/dataset.utils";
import { periodLabel, rangeFor, reportBody } from "../../../utils/report.utils";
import { printReport } from "../../../utils/print.utils";
import { useQuery } from "../../common/query.hook";
import { useSearchParam } from "../../common/search.param.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useExpenseCategoryListHook } from "../expense-category/expense.category.list.hook";
import { ledgerSummaryQueryOf } from "../ledger/ledger.list.hook";
import {
  matchesPaymentFilters,
  paymentDatasetKeyOf,
} from "../payment/payment.list.hook";
import { transactionSummaryQueryOf } from "../transaction/transaction.list.hook";
import { useReportSummaryHook } from "./report.summary.hook";

const isUnpaid = (row: ILedgerRow) => row.status !== "paid";

const branchFilterOf = (branch: string | null): ILedgerFilters =>
  branch ? { branch } : {};

const rangeKeyOf = (type: ReportType): string[] => {
  const { from, to } = rangeFor(type);
  return [from, to];
};

const reportPeriodFiltersOf = (
  type: ReportType,
  branch: string | null
): ILedgerFilters => {
  const { from, to } = rangeFor(type);
  return { dateFrom: from, dateTo: to, ...branchFilterOf(branch) };
};

export const reportTransactionQueryOf = (
  type: ReportType,
  branch: string | null
): IQuerySpec<IDisbursement[]> => [
  scopedKey(reportTransactionKey, type, branch, ...rangeKeyOf(type)),
  transactionSummaryQueryOf(reportPeriodFiltersOf(type, branch))[1],
];

export const reportCustomerPaymentQueryOf = (
  type: ReportType,
  branch: string | null
): IQuerySpec<ILedgerPayment[]> => [
  scopedKey(reportPaymentKey, type, branch, ...rangeKeyOf(type)),
  withOfflineDerive(
    () =>
      paymentServices.getAllInPeriod(
        "receivable",
        reportPeriodFiltersOf(type, branch)
      ),
    (read) => {
      const filters = reportPeriodFiltersOf(type, branch);

      return derivedRows(
        datasetSourcesOf(paymentDatasetKeyOf("receivable"), [
          datasetFiltersOf(filters),
        ]),
        filters,
        matchesPaymentFilters(filters)
      )(read);
    }
  ),
];

export const reportReceivableQueryOf = (
  branch: string | null
): IQuerySpec<IReceivable[]> => [
  scopedKey(reportReceivableKey, branch),
  ledgerSummaryQueryOf("receivables", receivableServices, branchFilterOf(branch))[1],
];

export const reportPayableQueryOf = (
  branch: string | null
): IQuerySpec<IPayable[]> => [
  scopedKey(reportPayableKey, branch),
  ledgerSummaryQueryOf("payables", payableServices, branchFilterOf(branch))[1],
];

export const useReportHook = () => {
  const { value: type, setValue: setType } = useSearchParam<ReportType>(
    "type",
    reportTypeValues,
    "summary"
  );

  const { from, to } = rangeFor(type);
  const { branch, branchName, printScope } = useBranchScopeHook();
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

  const isCashFlow = type === "cashflow";

  const customerPaymentQuery = useQuery(
    ...reportCustomerPaymentQueryOf(type, branch),
    { enabled: isCashFlow }
  );

  const receivableQuery = useQuery(...reportReceivableQueryOf(branch), {
    enabled: type === "receivables",
  });

  const payableQuery = useQuery(...reportPayableQueryOf(branch), {
    enabled: type === "payables",
  });

  const transactions = transactionQuery.data ?? [];
  const customerPayments = customerPaymentQuery.data ?? [];
  const receivables = (receivableQuery.data ?? []).filter(isUnpaid);
  const payables = (payableQuery.data ?? []).filter(isUnpaid);

  const activeQuery =
    type === "receivables"
      ? receivableQuery
      : type === "payables"
        ? payableQuery
        : transactionQuery;

  const cashFlowQueries = isCashFlow ? [customerPaymentQuery] : [];
  const activeQueries = [activeQuery, ...cashFlowQueries];
  const activeLoading = activeQueries.some((query) => query.isInitialLoading);
  const activeRefreshing = activeQueries.some((query) => query.isRefreshing);
  const activeError =
    activeQueries.find((query) => query.error !== null)?.error ?? null;
  const retryActive = () => activeQueries.forEach((query) => query.refetch());

  const printActiveReport = () =>
    printReport({
      title: `${reportTypeLabels[type]} Report`,
      period: periodLabel(type, from, to),
      scope: printScope,
      ...reportBody(type, {
        transactions,
        customerPayments,
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
    customerPayments,
    receivables,
    payables,
    expenseCategories,
    branchNameOf,
    ...summary,
    loading: isSummary ? summaryLoading : activeLoading,
    refreshing: isSummary ? summaryRefreshing : activeRefreshing,
    error: isSummary ? summaryError : activeError,
    retry: isSummary ? retrySummary : retryActive,
    print: isSummary ? printSummary : printActiveReport,
  };
};
