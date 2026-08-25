import {
  dashboardAlertsKey,
  dashboardSalesKey,
  dashboardSummaryKey,
  scopedKey,
} from "../../../keys/query.keys";
import type {
  IDailySalesPoint,
  IDashboardSummary,
  IDueAlerts,
} from "../../../models/data/dashboard/dashboard.response";
import dashboardServices from "../../../services/data/dashboard.services";
import { useDashboardStore } from "../../../store/data/dashboard/dashboard.store";
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

  const summary = summaryQuery.data;
  const cashIn = summary?.monthlyCashIn ?? 0;
  const cashOut = summary?.monthlyCashOut ?? 0;

  return {
    branchName,
    salesPeriod,
    setSalesPeriod,
    summary,
    summaryLoading: summaryQuery.loading,
    series: salesQuery.data ?? [],
    salesLoading: salesQuery.loading,
    alerts: alertsQuery.data,
    alertsLoading: alertsQuery.loading,
    netProfit: summary
      ? summary.monthlySales - summary.monthlyExpenses
      : undefined,
    lastMonthNetProfit: summary
      ? summary.lastMonthSales - summary.lastMonthExpenses
      : undefined,
    cashIn,
    cashOut,
    netCashFlow: cashIn - cashOut,
  };
};
