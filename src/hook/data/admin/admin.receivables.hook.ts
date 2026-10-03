import { adminReceivableSheetModalKey } from "../../../keys/modal.keys";
import { dashboardAlertsKey, scopedKey } from "../../../keys/query.keys";
import { adminReceivablesSegmentKey } from "../../../keys/segment.keys";
import {
  adminReceivableSegmentCaptions,
  adminReceivableSegmentLabels,
  adminReceivableSegmentValues,
  daysUntil,
  dueHorizonDays,
  dueStatusOf,
} from "../../../models/data/admin/admin.response";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import dashboardServices from "../../../services/data/dashboard.services";
import { useIsPhone } from "../../common/breakpoint.hook";
import { useModal } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useSegment } from "../../common/segment.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useCustomerListHook } from "../party/customer.list.hook";

import type { ISegmentOption } from "../../../models/common/segment.model";
import type {
  AdminReceivableSegment,
  IAdminReceivableRow,
} from "../../../models/data/admin/admin.response";
import type { IDueAlerts } from "../../../models/data/dashboard/dashboard.response";
import type { IReceivable } from "../../../models/data/ledger/ledger.response";
import type { ICustomer } from "../../../models/data/party/party.response";

const minPhoneDigits = 7;

const phoneHrefOf = (contact: string | null | undefined): string | null => {
  if (!contact) return null;
  const dialable = contact.replace(/[^\d+]/g, "");
  const digitCount = dialable.replace(/\D/g, "").length;
  return digitCount >= minPhoneDigits ? `tel:${dialable}` : null;
};

const toReceivableRow = (receivable: IReceivable): IAdminReceivableRow => ({
  key: receivable.id,
  name: receivable.customer_name,
  meta: receivable.reference_number ?? "Receivable",
  amount: ledgerBalance(receivable),
  due: dueStatusOf(receivable.due_date),
  record: receivable,
});

const byDueDate = (first: IReceivable, second: IReceivable) =>
  first.due_date.localeCompare(second.due_date);

const toRows = (receivables: readonly IReceivable[]) =>
  [...receivables].sort(byDueDate).map(toReceivableRow);

const isDueToday = (receivable: IReceivable) => daysUntil(receivable.due_date) === 0;

export const useAdminReceivablesHook = () => {
  const { branch } = useBranchScopeHook();
  const { branchName } = useBranchListHook();
  const { customers } = useCustomerListHook();
  const isPhone = useIsPhone();
  const { segment, setSegment } = useSegment(
    adminReceivablesSegmentKey,
    adminReceivableSegmentValues
  );
  const { modal, openModal, closeModal } = useModal<IReceivable>(
    adminReceivableSheetModalKey
  );

  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(dueHorizonDays, branch)
  );

  const alerts = alertsQuery.data;
  const upcoming = alerts?.nearDueReceivables;
  const rowsBySegment: Record<AdminReceivableSegment, IAdminReceivableRow[] | undefined> = {
    overdue: alerts && toRows(alerts.overdueReceivables),
    today: upcoming && toRows(upcoming.filter(isDueToday)),
    week: upcoming && toRows(upcoming.filter((receivable) => !isDueToday(receivable))),
  };

  const segmentOptions: ISegmentOption<AdminReceivableSegment>[] =
    adminReceivableSegmentValues.map((value) => ({
      key: value,
      label: adminReceivableSegmentLabels[value],
      count: rowsBySegment[value]?.length,
    }));

  const selected = modal.data ?? null;
  const customer: ICustomer | undefined = selected?.customer_id
    ? customers.find((candidate) => candidate.id === selected.customer_id)
    : undefined;

  return {
    segment,
    segmentOptions,
    setSegment,
    caption: adminReceivableSegmentCaptions[segment],
    rows: rowsBySegment[segment] ?? [],
    loading: alertsQuery.isInitialLoading,
    refreshing: alertsQuery.isRefreshing,
    error: alertsQuery.error,
    retry: alertsQuery.refetch,
    selected,
    customer: customer ?? null,
    branchLabel: selected ? branchName(selected.branch) : null,
    phoneHref: phoneHrefOf(customer?.contact),
    sheetOpen: modal.visible,
    split: !isPhone,
    isSelected: (row: IAdminReceivableRow) =>
      modal.visible && row.record.id === selected?.id,
    openRow: (row: IAdminReceivableRow) => openModal(row.record),
    closeSheet: closeModal,
  };
};
