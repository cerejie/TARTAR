import { useNavigate } from "react-router-dom";
import {
  dashboardAlertsKey,
  dashboardOverviewKey,
  dashboardSalesKey,
  scopedKey,
} from "../../../keys/query.keys";
import { adminHomePeriodSegmentKey } from "../../../keys/segment.keys";
import {
  overviewPeriodCaptions,
  overviewPeriodLabels,
  overviewPeriodValues,
  overviewSalesPeriods,
} from "../../../models/data/dashboard/dashboard.response";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import dashboardServices from "../../../services/data/dashboard.services";
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
  NotificationTone,
  OverviewPeriod,
} from "../../../models/data/dashboard/dashboard.response";

const alertHorizonDays = 7;

const periodOptions: readonly ISegmentOption<OverviewPeriod>[] =
  overviewPeriodValues.map((value) => ({
    key: value,
    label: overviewPeriodLabels[value],
  }));

const toAttentionItem = (
  key: string,
  name: string,
  rows: readonly { amount: number; paid_amount: number }[],
  tone: NotificationTone,
  path: string
): IAttentionItem => ({
  key,
  name,
  count: rows.length,
  amount: rows.reduce((total, row) => total + ledgerBalance(row), 0),
  tone,
  path,
});

const attentionItemsOf = (alerts: IDueAlerts | undefined): IAttentionItem[] => {
  if (!alerts) return [];
  return [
    toAttentionItem(
      "overdue-receivables",
      "Overdue receivables",
      alerts.overdueReceivables,
      "negative",
      adminReceivablesPath
    ),
    toAttentionItem(
      "overdue-payables",
      "Overdue payables",
      alerts.overduePayables,
      "negative",
      adminPayablesPath
    ),
    toAttentionItem(
      "near-due-receivables",
      "Receivables due this week",
      alerts.nearDueReceivables,
      "warning",
      adminReceivablesPath
    ),
    toAttentionItem(
      "near-due-payables",
      "Payables due this week",
      alerts.nearDuePayables,
      "warning",
      adminPayablesPath
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
    () => dashboardServices.getDueAlerts(alertHorizonDays, branch)
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
    attentionItems: attentionItemsOf(alertsQuery.data),
    attentionLoading: alertsQuery.isInitialLoading,
    attentionRefreshing: alertsQuery.isRefreshing,
    attentionError: alertsQuery.error,
    retryAttention: alertsQuery.refetch,
    openAttentionItem: (item: IAttentionItem) => navigate(item.path),
  };
};
