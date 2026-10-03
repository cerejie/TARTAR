import { useNavigate } from "react-router-dom";
import {
  dashboardAlertsKey,
  dashboardChecksKey,
  dashboardOverviewKey,
  dashboardSalesKey,
  scopedKey,
} from "../../../keys/query.keys";
import { adminHomePeriodSegmentKey } from "../../../keys/segment.keys";
import {
  checkDueDateOf,
  dueHorizonDays,
} from "../../../models/data/admin/admin.response";
import {
  overviewPeriodCaptions,
  overviewPeriodLabels,
  overviewPeriodValues,
  overviewSalesPeriods,
} from "../../../models/data/dashboard/dashboard.response";
import dashboardServices from "../../../services/data/dashboard.services";
import { balancesOf, toAttentionItem } from "../../../utils/attention.utils";
import { todayIso } from "../../../utils/format.utils";
import { adminPayablesPath, adminReceivablesPath } from "../../../utils/route.utils";
import { useQuery } from "../../common/query.hook";
import { useSegment } from "../../common/segment.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

import type { ISegmentOption } from "../../../models/common/segment.model";
import type {
  IAttentionItem,
  IDailySalesPoint,
  IDashboardOverview,
  IDueAlerts,
  OverviewPeriod,
} from "../../../models/data/dashboard/dashboard.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

const periodOptions: readonly ISegmentOption<OverviewPeriod>[] =
  overviewPeriodValues.map((value) => ({
    key: value,
    label: overviewPeriodLabels[value],
  }));

const checkAmountsOf = (checks: readonly IVoucher[], pastDated: boolean) =>
  checks
    .filter((check) => (checkDueDateOf(check) < todayIso()) === pastDated)
    .map((check) => Number(check.amount));

const attentionItemsOf = (
  alerts: IDueAlerts | undefined,
  checks: readonly IVoucher[] | undefined
): IAttentionItem[] => {
  if (!alerts || !checks) return [];
  return [
    toAttentionItem(
      "overdue-receivables",
      "Overdue receivables",
      balancesOf(alerts.overdueReceivables),
      "negative",
      adminReceivablesPath
    ),
    toAttentionItem(
      "overdue-payables",
      "Overdue payables",
      balancesOf(alerts.overduePayables),
      "negative",
      adminPayablesPath
    ),
    toAttentionItem(
      "past-dated-checks",
      "Past-dated checks, unpaid",
      checkAmountsOf(checks, true),
      "negative",
      adminPayablesPath,
      "check"
    ),
    toAttentionItem(
      "near-due-receivables",
      "Receivables due this week",
      balancesOf(alerts.nearDueReceivables),
      "warning",
      adminReceivablesPath
    ),
    toAttentionItem(
      "near-due-payables",
      "Payables due this week",
      balancesOf(alerts.nearDuePayables),
      "warning",
      adminPayablesPath
    ),
    toAttentionItem(
      "due-checks",
      "Checks due this week",
      checkAmountsOf(checks, false),
      "warning",
      adminPayablesPath,
      "check"
    ),
  ].filter((item) => item.count > 0);
};

export const useAdminHomeHook = () => {
  const navigate = useNavigate();
  const { branch } = useBranchScopeHook();
  const { segment: period, setSegment: setPeriod } = useSegment(
    adminHomePeriodSegmentKey,
    overviewPeriodValues
  );
  const salesPeriod = overviewSalesPeriods[period];

  const overviewQuery = useQuery<IDashboardOverview>(
    scopedKey(dashboardOverviewKey, branch, period),
    () => dashboardServices.getOverview(period, branch)
  );

  const salesQuery = useQuery<IDailySalesPoint[]>(
    scopedKey(dashboardSalesKey, branch, salesPeriod),
    () => dashboardServices.getSalesSeries(salesPeriod, branch)
  );

  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(dueHorizonDays, branch)
  );

  const checksQuery = useQuery<IVoucher[]>(
    scopedKey(dashboardChecksKey, branch),
    () => dashboardServices.getDueChecks(dueHorizonDays, branch)
  );

  const overview = overviewQuery.data;

  return {
    period,
    periodOptions,
    setPeriod,
    periodCaption: overviewPeriodCaptions[period],
    showNewAmounts: period !== "all",
    sales: overview?.sales,
    expenses: overview?.expenses,
    arOutstanding: overview?.arOutstanding,
    arNew: overview?.arNew ?? 0,
    apOutstanding: overview?.apOutstanding,
    apNew: overview?.apNew ?? 0,
    receivablesPath: adminReceivablesPath,
    payablesPath: adminPayablesPath,
    overviewLoading: overviewQuery.isInitialLoading,
    overviewError: overviewQuery.error,
    retryOverview: overviewQuery.refetch,
    salesPeriod,
    series: salesQuery.data ?? [],
    salesLoading: salesQuery.isInitialLoading,
    salesError: salesQuery.error,
    retrySales: salesQuery.refetch,
    attentionItems: attentionItemsOf(alertsQuery.data, checksQuery.data),
    attentionLoading: alertsQuery.isInitialLoading || checksQuery.isInitialLoading,
    attentionRefreshing: alertsQuery.isRefreshing || checksQuery.isRefreshing,
    attentionError: alertsQuery.error ?? checksQuery.error,
    retryAttention: () => {
      alertsQuery.refetch();
      checksQuery.refetch();
    },
    openAttentionItem: (item: IAttentionItem) => navigate(item.path),
  };
};
