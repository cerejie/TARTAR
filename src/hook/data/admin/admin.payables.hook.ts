import { adminPayableSheetModalKey } from "../../../keys/modal.keys";
import {
  dashboardAlertsKey,
  dashboardChecksKey,
  scopedKey,
} from "../../../keys/query.keys";
import { adminPayablesSegmentKey } from "../../../keys/segment.keys";
import {
  adminPayableSegmentCaptions,
  adminPayableSegmentLabels,
  adminPayableSegmentValues,
  checkDueDateOf,
  dueHorizonDays,
  dueStatusOf,
} from "../../../models/data/admin/admin.response";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import dashboardServices from "../../../services/data/dashboard.services";
import { payablesPath, vouchersPath } from "../../../utils/route.utils";
import { useIsPhone } from "../../common/breakpoint.hook";
import { useModal } from "../../common/modal.hook";
import { useQuery } from "../../common/query.hook";
import { useSegment } from "../../common/segment.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";

import type { ISegmentOption } from "../../../models/common/segment.model";
import type {
  AdminPayableSegment,
  IAdminPayableEntry,
  IAdminPayableRow,
} from "../../../models/data/admin/admin.response";
import type { IDueAlerts } from "../../../models/data/dashboard/dashboard.response";
import type { IPayable } from "../../../models/data/ledger/ledger.response";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";

const checkMeta = (check: IVoucher) =>
  [check.check_bank, check.check_number ? `#${check.check_number}` : null]
    .filter(Boolean)
    .join(" · ") || "Check";

const toCheckRow = (check: IVoucher): IAdminPayableRow => ({
  key: `check-${check.id}`,
  name: check.payee,
  meta: checkMeta(check),
  amount: Number(check.amount),
  due: dueStatusOf(checkDueDateOf(check)),
  entry: { kind: "check", record: check },
});

const toPayableRow = (payable: IPayable): IAdminPayableRow => ({
  key: `payable-${payable.id}`,
  name: payable.supplier_name,
  meta: payable.reference_number ?? "Payable",
  amount: ledgerBalance(payable),
  due: dueStatusOf(payable.due_date),
  entry: { kind: "payable", record: payable },
});

const byDueDate = (first: IPayable, second: IPayable) =>
  first.due_date.localeCompare(second.due_date);

const openPathOf = (entry: IAdminPayableEntry) =>
  entry.kind === "check" ? vouchersPath : payablesPath;

const isSameEntry = (first: IAdminPayableEntry, second: IAdminPayableEntry | null) =>
  first.kind === second?.kind && first.record.id === second.record.id;

export const useAdminPayablesHook = () => {
  const { branch } = useBranchScopeHook();
  const isPhone = useIsPhone();
  const { segment, setSegment } = useSegment(
    adminPayablesSegmentKey,
    adminPayableSegmentValues
  );
  const { modal, openModal, closeModal } = useModal<IAdminPayableEntry>(
    adminPayableSheetModalKey
  );

  const checksQuery = useQuery<IVoucher[]>(
    scopedKey(dashboardChecksKey, branch),
    () => dashboardServices.getDueChecks(dueHorizonDays, branch)
  );

  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(dueHorizonDays, branch)
  );

  const alerts = alertsQuery.data;
  const rowsBySegment: Record<AdminPayableSegment, IAdminPayableRow[] | undefined> = {
    checks: checksQuery.data?.map(toCheckRow),
    nearDue: alerts && [...alerts.nearDuePayables].sort(byDueDate).map(toPayableRow),
    overdue: alerts && [...alerts.overduePayables].sort(byDueDate).map(toPayableRow),
  };

  const segmentOptions: ISegmentOption<AdminPayableSegment>[] =
    adminPayableSegmentValues.map((value) => ({
      key: value,
      label: adminPayableSegmentLabels[value],
      count: rowsBySegment[value]?.length,
    }));

  const activeQuery = segment === "checks" ? checksQuery : alertsQuery;
  const selected = modal.data ?? null;

  return {
    segment,
    segmentOptions,
    setSegment,
    caption: adminPayableSegmentCaptions[segment],
    rows: rowsBySegment[segment] ?? [],
    loading: activeQuery.isInitialLoading,
    refreshing: activeQuery.isRefreshing,
    error: activeQuery.error,
    retry: activeQuery.refetch,
    selected,
    sheetOpen: modal.visible,
    split: !isPhone,
    isSelected: (row: IAdminPayableRow) => modal.visible && isSameEntry(row.entry, selected),
    openPath: selected ? openPathOf(selected) : payablesPath,
    openRow: (row: IAdminPayableRow) => openModal(row.entry),
    closeSheet: closeModal,
  };
};
