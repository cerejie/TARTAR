import { useNavigate } from "react-router-dom";
import {
  dashboardAlertsKey,
  dashboardProfitKey,
  dashboardReviewsKey,
  dashboardSalesKey,
  dashboardSummaryKey,
  scopedKey,
} from "../../../keys/query.keys";
import { salePaginationKey, voucherPaginationKey } from "../../../keys/table.keys";
import { protectedViewsRoutes } from "../../../routes/protected.view.routes";
import dashboardServices from "../../../services/data/dashboard.services";
import transactionServices from "../../../services/data/transaction.services";
import { useDashboardStore } from "../../../store/data/dashboard/dashboard.store";
import {
  dashboardAttentionItemsOf,
  pendingVouchersAttentionKey,
  salesToVerifyAttentionKey,
} from "../../../utils/attention.utils";
import { monthToDateRange } from "../../../utils/period.utils";
import { branchSummaryNet } from "../../../utils/report.utils";
import {
  filterRoutesByPermission,
  quickActionRoutesOf,
} from "../../../utils/route.utils";
import { usePermissions } from "../../account/account.permission.hook";
import { useFilterField } from "../../common/filter.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

import type { IQuerySpec } from "../../../models/common/query.model";
import type {
  IAttentionItem,
  IDailySalesPoint,
  IDashboardProfit,
  IDashboardSummary,
  IDueAlerts,
  IPendingReviews,
  SalesPeriod,
} from "../../../models/data/dashboard/dashboard.response";

const dueAlertDays = 7;

const profitOf = async (branch: string | null): Promise<IDashboardProfit> => {
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
};

export const dashboardSummaryQueryOf = (
  branch: string | null
): IQuerySpec<IDashboardSummary> => [
  scopedKey(dashboardSummaryKey, branch),
  () => dashboardServices.getSummary(branch),
];

export const dashboardSalesQueryOf = (
  branch: string | null,
  salesPeriod: SalesPeriod
): IQuerySpec<IDailySalesPoint[]> => [
  scopedKey(dashboardSalesKey, branch, salesPeriod),
  () => dashboardServices.getSalesSeries(salesPeriod, branch),
];

export const dashboardAlertsQueryOf = (
  branch: string | null
): IQuerySpec<IDueAlerts> => [
  scopedKey(dashboardAlertsKey, branch),
  () => dashboardServices.getDueAlerts(dueAlertDays, branch),
];

export const dashboardReviewsQueryOf = (
  branch: string | null
): IQuerySpec<IPendingReviews> => [
  scopedKey(dashboardReviewsKey, branch),
  () => dashboardServices.getPendingReviews(branch),
];

export const dashboardProfitQueryOf = (
  branch: string | null
): IQuerySpec<IDashboardProfit> => [
  scopedKey(dashboardProfitKey, branch),
  () => profitOf(branch),
];

export const useDashboardHook = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { branch, branchName } = useBranchScopeHook();
  const saleStatusFilter = useFilterField("page", "saleStatus", salePaginationKey);
  const voucherStatusFilter = useFilterField(
    "vouchers",
    "voucherStatus",
    voucherPaginationKey
  );
  const salesPeriod = useDashboardStore((state) => state.salesPeriod);
  const setSalesPeriod = useDashboardStore((state) => state.setSalesPeriod);

  const summaryQuery = useQuery(...dashboardSummaryQueryOf(branch));
  const salesQuery = useQuery(...dashboardSalesQueryOf(branch, salesPeriod));
  const alertsQuery = useQuery(...dashboardAlertsQueryOf(branch));
  const reviewsQuery = useQuery(...dashboardReviewsQueryOf(branch));
  const profitQuery = useQuery(...dashboardProfitQueryOf(branch));

  const summary = summaryQuery.data;
  const cashIn = summary?.monthlyCashIn ?? 0;
  const cashOut = summary?.monthlyCashOut ?? 0;

  const openAttentionItem = (item: IAttentionItem) => {
    if (item.key === pendingVouchersAttentionKey) {
      voucherStatusFilter.changeValue("pending");
    }
    if (item.key === salesToVerifyAttentionKey) {
      saleStatusFilter.changeValue("deposited");
    }
    navigate(item.path);
  };

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
    attentionItems: dashboardAttentionItemsOf(alertsQuery.data, reviewsQuery.data),
    attentionLoading: alertsQuery.isInitialLoading || reviewsQuery.isInitialLoading,
    attentionRefreshing: alertsQuery.isRefreshing || reviewsQuery.isRefreshing,
    attentionError: alertsQuery.error ?? reviewsQuery.error,
    retryAttention: () => {
      alertsQuery.refetch();
      reviewsQuery.refetch();
    },
    openAttentionItem,
    quickActions: quickActionRoutesOf(
      filterRoutesByPermission(protectedViewsRoutes, permissions)
    ),
    monthlyPendingSales: summary?.monthlyPendingSales ?? 0,
    monthlyExpenses: summary?.monthlyExpenses,
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
