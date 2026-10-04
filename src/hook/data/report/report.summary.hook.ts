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
import { withOfflineDerive } from "../../../utils/dataset.utils";
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
import { disbursementSummaryQueryOf } from "../disbursement/disbursement.list.hook";
import { transactionSummaryQueryOf } from "../transaction/transaction.list.hook";
import type { ILedgerFilters } from "../../../models/common/filter.model";
import type {
  IDateRange,
  IMonthYear,
  MonthValue,
} from "../../../models/common/period.model";
import type {
  IOfflineDerive,
  IQuerySpec,
} from "../../../models/common/query.model";
import type { IBranchSummaryData } from "../../../models/data/report/report.response";

export const currentMonthRange = (): IDateRange => monthYearRangeOf(currentMonthYear());

const derivedBranchSummaryOf =
  (filters: ILedgerFilters): IOfflineDerive<IBranchSummaryData> =>
  (read) => {
    const sales = transactionSummaryQueryOf({ ...filters, type: "sale" })[1].offline?.(read);
    const purchases = disbursementSummaryQueryOf("purchase", filters)[1].offline?.(read);
    const expenses = disbursementSummaryQueryOf("expense", filters)[1].offline?.(read);
    if (!sales || !purchases || !expenses) return undefined;

    return { sales, purchases, expenses };
  };

export const reportSummaryQueryOf = (
  range: IDateRange,
  branch: string | null
): IQuerySpec<IBranchSummaryData> => {
  const filters: ILedgerFilters = {
    dateFrom: range.from,
    dateTo: range.to,
    ...(branch ? { branch } : {}),
  };

  return [
    scopedKey(reportSummaryKey, range.from, range.to, branch),
    withOfflineDerive(
      () => transactionServices.getBranchSummary(filters),
      derivedBranchSummaryOf(filters)
    ),
  ];
};

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
