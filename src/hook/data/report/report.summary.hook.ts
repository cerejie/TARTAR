import { reportSummaryKey, scopedKey } from "../../../keys/query.keys";
import transactionServices from "../../../services/data/transaction.services";
import {
  currentMonthYear,
  monthYearOf,
  monthYearOfRange,
  monthYearRangeOf,
  recentYears,
  yearLabelsOf,
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
import type {
  IDateRange,
  IMonthYear,
  MonthValue,
} from "../../../models/common/period.model";
import type { IQuerySpec } from "../../../models/common/query.model";
import type { IBranchSummaryData } from "../../../models/data/report/report.response";

export const currentMonthRange = (): IDateRange => monthYearRangeOf(currentMonthYear());

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
  const { branch, printScope } = useBranchScopeHook();
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

  const summaryYears = recentYears();
  const rangeMonthYear = monthYearOfRange(range);
  const summaryMonthYear =
    rangeMonthYear && summaryYears.includes(rangeMonthYear.year)
      ? rangeMonthYear
      : undefined;
  const anchorMonthYear = summaryMonthYear ?? monthYearOf(range.from);

  const setSummaryMonthYear = (next: IMonthYear) => {
    const nextRange = monthYearRangeOf(next);
    setFilters({ dateFrom: nextRange.from, dateTo: nextRange.to });
  };

  const setSummaryMonth = (month: MonthValue | undefined) => {
    if (!month) return;
    setSummaryMonthYear({ ...anchorMonthYear, month });
  };

  const setSummaryYear = (year: string | undefined) => {
    if (!year) return;
    setSummaryMonthYear({ ...anchorMonthYear, year });
  };

  const setSummaryRange = (from: string | undefined, to: string | undefined) =>
    setFilters({ dateFrom: from, dateTo: to });

  const printSummary = () =>
    printReport(
      branchSummaryPrintDocument(
        summaryRows,
        summaryTotals,
        range,
        printScope
      )
    );

  return {
    summaryRows,
    summaryTotals,
    summaryRange: range,
    summaryMonth: summaryMonthYear?.month,
    summaryYear: summaryMonthYear?.year,
    summaryYears,
    summaryYearLabels: yearLabelsOf(summaryYears),
    setSummaryMonth,
    setSummaryYear,
    setSummaryRange,
    printSummary,
    summaryLoading: query.isInitialLoading,
    summaryRefreshing: query.isRefreshing,
    summaryError: query.error,
    retrySummary: query.refetch,
  };
};
