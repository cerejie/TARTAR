import { reportSummaryKey, scopedKey } from "../../../keys/query.keys";
import transactionServices from "../../../services/data/transaction.services";
import {
  currentMonth,
  monthLabelsOf,
  monthOfRange,
  monthRangeOf,
  recentMonths,
} from "../../../utils/period.utils";
import { printReport } from "../../../utils/print.utils";
import {
  branchSummaryPrintDocument,
  branchSummaryRows,
  branchSummaryTotals,
} from "../../../utils/report.utils";
import { useLedgerFilters } from "../../common/filter.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import type { IDateRange } from "../../../models/common/period.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type { IBranchSummaryData } from "../../../models/data/report/report.response";

export const currentMonthRange = (): IDateRange => monthRangeOf(currentMonth());

export const reportSummaryQueryOf = (
  range: IDateRange,
  branch: string | null
): IQuerySpec<IBranchSummaryData> => [
  scopedKey(reportSummaryKey, range.from, range.to, branch),
  () =>
    transactionServices.getBranchSummary({
      dateFrom: range.from,
      dateTo: range.to,
      ...(branch ? { branch } : {}),
    }),
];

export const useReportSummaryHook = (enabled: boolean) => {
  const { filters, setFilters } = useLedgerFilters("report-summary");
  const { branch, branchName } = useBranchScopeHook();
  const { branchName: branchNameOf } = useBranchListHook();

  const monthRange = currentMonthRange();
  const range: IDateRange = {
    from: filters.dateFrom ?? monthRange.from,
    to: filters.dateTo ?? monthRange.to,
  };

  const query = useQuery(...reportSummaryQueryOf(range, branch), { enabled });

  const summaryRows = query.data
    ? branchSummaryRows(query.data, branchNameOf)
    : [];
  const summaryTotals = branchSummaryTotals(summaryRows);

  const summaryMonths = recentMonths();
  const rangeMonth = monthOfRange(range);
  const summaryMonth =
    rangeMonth && summaryMonths.includes(rangeMonth) ? rangeMonth : undefined;

  const setSummaryMonth = (month: string | undefined) => {
    if (!month) return;
    const next = monthRangeOf(month);
    setFilters({ dateFrom: next.from, dateTo: next.to });
  };

  const setSummaryRange = (from: string | undefined, to: string | undefined) =>
    setFilters({ dateFrom: from, dateTo: to });

  const printSummary = () =>
    printReport(
      branchSummaryPrintDocument(
        summaryRows,
        summaryTotals,
        range,
        branchName ?? "All branches"
      )
    );

  return {
    summaryRows,
    summaryTotals,
    summaryRange: range,
    summaryMonth,
    summaryMonths,
    summaryMonthLabels: monthLabelsOf(summaryMonths),
    setSummaryMonth,
    setSummaryRange,
    printSummary,
    summaryLoading: query.isInitialLoading,
    summaryRefreshing: query.isRefreshing,
    summaryError: query.error,
    retrySummary: query.refetch,
  };
};
