import { useNavigate } from "react-router-dom";
import { dashboardAlertsKey, dashboardChecksKey, scopedKey } from "../../../keys/query.keys";
import { adminNotificationsSegmentKey } from "../../../keys/segment.keys";
import {
  adminNotificationSegmentLabels,
  adminNotificationSegmentValues,
  checkDueDateOf,
  dueHorizonDays,
  dueStatusOf,
} from "../../../models/data/admin/admin.response";
import dashboardServices from "../../../services/data/dashboard.services";
import {
  selectReadIds,
  useNotificationReadStore,
} from "../../../store/data/admin/notification.read.store";
import { notificationBankOf, notificationGroups } from "../../../utils/notification.utils";
import { adminPayablesPath, adminReceivablesPath } from "../../../utils/route.utils";
import { useQuery } from "../../common/query.hook";
import { useSegment } from "../../common/segment.hook";
import { useBankAccountListHook } from "../bank/bank.account.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

import type { ISegmentOption } from "../../../models/common/segment.model";
import type {
  AdminNotificationSegment,
  IAdminNotification,
  IAdminNotificationGroup,
} from "../../../models/data/admin/admin.response";
import type {
  IDueAlerts,
  INotificationRow,
} from "../../../models/data/dashboard/dashboard.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

const readIdOf = (rowId: string, dueDate: string) => `${rowId}-${dueDate}`;

const alertGroupsOf = (
  alerts: IDueAlerts,
  readIds: ReadonlySet<string>,
  bankOf: (row: INotificationRow) => string | null
): IAdminNotificationGroup[] =>
  notificationGroups(alerts).map((group) => ({
    key: group.key,
    label: group.label,
    tone: group.variant,
    items: group.rows.map((row) => {
      const id = readIdOf(row.id, row.dueDate);
      const bank = bankOf(row);
      return {
        id,
        name: row.name,
        description: bank ? `${group.describe(row)} · ${bank}` : group.describe(row),
        amount: row.amount,
        path: row.ledger === "receivable" ? adminReceivablesPath : adminPayablesPath,
        unread: !readIds.has(id),
      };
    }),
  }));

const checkNotificationOf = (check: IVoucher, readIds: ReadonlySet<string>): IAdminNotification => {
  const dueDate = checkDueDateOf(check);
  const id = readIdOf(`c-${check.id}`, dueDate);
  return {
    id,
    name: check.payee,
    description: `Check ${dueStatusOf(dueDate).label.toLowerCase()}`,
    amount: Number(check.amount),
    path: adminPayablesPath,
    unread: !readIds.has(id),
  };
};

const checkGroupsOf = (checks: readonly IVoucher[], readIds: ReadonlySet<string>): IAdminNotificationGroup[] =>
  checks.length
    ? [
        {
          key: "checks",
          label: "Checks Due",
          tone: "warning",
          items: checks.map((check) => checkNotificationOf(check, readIds)),
        },
      ]
    : [];

const unreadGroupsOf = (groups: readonly IAdminNotificationGroup[]) =>
  groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.unread) }))
    .filter((group) => group.items.length);

const useAdminNotificationFeed = () => {
  const { branch } = useBranchScopeHook();
  const readIds = useNotificationReadStore(selectReadIds);
  const { paymentLabelOf } = useBankAccountListHook();
  const bankOf = (row: INotificationRow) => notificationBankOf(row, paymentLabelOf);

  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(dueHorizonDays, branch)
  );

  const checksQuery = useQuery<IVoucher[]>(
    scopedKey(dashboardChecksKey, branch),
    () => dashboardServices.getDueChecks(dueHorizonDays, branch)
  );

  const readSet = new Set(readIds);
  const groups = [
    ...(alertsQuery.data ? alertGroupsOf(alertsQuery.data, readSet, bankOf) : []),
    ...(checksQuery.data ? checkGroupsOf(checksQuery.data, readSet) : []),
  ];
  const unreadGroups = unreadGroupsOf(groups);
  const unreadCount = unreadGroups.reduce((total, group) => total + group.items.length, 0);

  return { groups, unreadGroups, unreadCount, alertsQuery, checksQuery };
};

export const useAdminNotificationCountHook = () => {
  const { unreadCount } = useAdminNotificationFeed();
  return { unreadCount };
};

export const useAdminNotificationsHook = () => {
  const navigate = useNavigate();
  const markRead = useNotificationReadStore((state) => state.markRead);
  const { segment, setSegment } = useSegment(
    adminNotificationsSegmentKey,
    adminNotificationSegmentValues
  );
  const { groups, unreadGroups, unreadCount, alertsQuery, checksQuery } =
    useAdminNotificationFeed();

  const totalCount = groups.reduce((total, group) => total + group.items.length, 0);
  const countBySegment: Record<AdminNotificationSegment, number> = {
    all: totalCount,
    unread: unreadCount,
  };

  const segmentOptions: ISegmentOption<AdminNotificationSegment>[] =
    adminNotificationSegmentValues.map((value) => ({
      key: value,
      label: adminNotificationSegmentLabels[value],
      count: countBySegment[value],
    }));

  return {
    segment,
    segmentOptions,
    setSegment,
    groups: segment === "unread" ? unreadGroups : groups,
    emptyText: segment === "unread" ? "You're all caught up" : "No due alerts right now",
    unreadCount,
    loading: alertsQuery.isInitialLoading || checksQuery.isInitialLoading,
    refreshing: alertsQuery.isRefreshing || checksQuery.isRefreshing,
    error: alertsQuery.error ?? checksQuery.error,
    retry: () => {
      void alertsQuery.refetch();
      void checksQuery.refetch();
    },
    openItem: (item: IAdminNotification) => {
      markRead([item.id]);
      navigate(item.path);
    },
    markAllRead: () =>
      markRead(unreadGroups.flatMap((group) => group.items.map((item) => item.id))),
  };
};
