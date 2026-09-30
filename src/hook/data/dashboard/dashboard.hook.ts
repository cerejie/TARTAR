import {
  dashboardAlertsKey,
  dashboardProfitKey,
  dashboardSalesKey,
  dashboardSummaryKey,
  scopedKey,
} from "../../../keys/query.keys";
import type {
  IDailySalesPoint,
  IDashboardProfit,
  IDashboardSummary,
  IDueAlerts,
} from "../../../models/data/dashboard/dashboard.response";
import dashboardServices from "../../../services/data/dashboard.services";
import transactionServices from "../../../services/data/transaction.services";
import { useDashboardStore } from "../../../store/data/dashboard/dashboard.store";
import { monthToDateRange } from "../../../utils/period.utils";
import { branchSummaryNet } from "../../../utils/report.utils";
import { useQuery } from "../../common/query.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

export const useDashboardHook = () => {
  const { branch, branchName } = useBranchScopeHook();
  const salesPeriod = useDashboardStore((state) => state.salesPeriod);
  const setSalesPeriod = useDashboardStore((state) => state.setSalesPeriod);

  const summaryQuery = useQuery<IDashboardSummary>(
    scopedKey(dashboardSummaryKey, branch),
    () => dashboardServices.getSummary(branch)
  );

  const salesQuery = useQuery<IDailySalesPoint[]>(
    scopedKey(dashboardSalesKey, branch, salesPeriod),
    () => dashboardServices.getSalesSeries(salesPeriod, branch)
  );

  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(7, branch)
  );

  const profitQuery = useQuery<IDashboardProfit>(
    scopedKey(dashboardProfitKey, branch),
    async () => {
      const [current, previous] = await Promise.all(
        [monthToDateRange(0), monthToDateRange(1)].map((range) =>
          transactionServices.getBranchSummary({
            dateFrom: range.from,
            dateTo: range.to,
            ...(branch ? { branch } : {}),
          })
        )
      );
      return {
        current: branchSummaryNet(current),
        previous: branchSummaryNet(previous),
      };
    }
  );

  const summary = summaryQuery.data;
  const cashIn = summary?.monthlyCashIn ?? 0;
  const cashOut = summary?.monthlyCashOut ?? 0;

  return {
    branchName,
    salesPeriod,
    setSalesPeriod,
    summary,
    summaryLoading: summaryQuery.isInitialLoading,
    summaryError: summaryQuery.error,
    retrySummary: summaryQuery.refetch,
    series: salesQuery.data ?? [],
    salesLoading: salesQuery.isInitialLoading,
    salesError: salesQuery.error,
    retrySales: salesQuery.refetch,
    alerts: alertsQuery.data,
    alertsLoading: alertsQuery.isInitialLoading,
    alertsError: alertsQuery.error,
    retryAlerts: alertsQuery.refetch,
    monthlyPendingSales: summary?.monthlyPendingSales ?? 0,
    netProfit: profitQuery.data?.current,
    lastMonthNetProfit: profitQuery.data?.previous,
    profitLoading: profitQuery.isInitialLoading,
    profitError: profitQuery.error,
    retryProfit: profitQuery.refetch,
    cashIn,
    cashOut,
    netCashFlow: cashIn - cashOut,
  };
};
