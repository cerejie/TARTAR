import {
  notificationKindLabels,
  type IDueAlerts,
  type IDuePayable,
  type INotificationGroup,
  type INotificationRow,
  type IPaymentAccountRef,
} from "../models/data/dashboard/dashboard.response";
import {
  ledgerBalance,
  type IReceivable,
} from "../models/data/ledger/ledger.response";
import { addDaysIso, daysBetween, formatDate, todayIso } from "./format.utils";

const toRows = (
  receivables: IReceivable[],
  payables: IDuePayable[]
): INotificationRow[] =>
  [
    ...receivables.map(
      (row): INotificationRow => ({
        id: `r-${row.id}`,
        name: row.customer_name,
        amount: ledgerBalance(row),
        dueDate: row.due_date,
        kind: "receivable",
        ledger: "receivable",
        partyId: row.customer_id,
        payment: null,
        checkBank: null,
      })
    ),
    ...payables.map(
      (row): INotificationRow => ({
        id: `p-${row.id}`,
        name: row.supplier_name,
        amount: ledgerBalance(row),
        dueDate: row.due_date,
        kind: row.source ?? "payable",
        ledger: "payable",
        partyId: row.supplier_id,
        payment: row.payment,
        checkBank: row.check_bank,
      })
    ),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

export const notificationBankOf = (
  row: INotificationRow,
  paymentLabelOf: (payment: IPaymentAccountRef) => string
): string | null => (row.payment ? paymentLabelOf(row.payment) : row.checkBank);

export const notificationGroups = (data: IDueAlerts): INotificationGroup[] => {
  const overdue = toRows(data.overdueReceivables, data.overduePayables);
  const nearDue = toRows(data.nearDueReceivables, data.nearDuePayables);

  const today = todayIso();
  const tomorrow = addDaysIso(1);

  const groups: INotificationGroup[] = [
    {
      key: "overdue",
      label: "Overdue",
      variant: "negative",
      rows: overdue,
      describe: (row) => {
        const days = daysBetween(row.dueDate, today);
        return `${notificationKindLabels[row.kind]} overdue by ${days} day${
          days === 1 ? "" : "s"
        }`;
      },
    },
    {
      key: "today",
      label: "Due Today",
      variant: "warning",
      rows: nearDue.filter((row) => row.dueDate === today),
      describe: (row) => `${notificationKindLabels[row.kind]} due today`,
    },
    {
      key: "tomorrow",
      label: "Due Tomorrow",
      variant: "warning",
      rows: nearDue.filter((row) => row.dueDate === tomorrow),
      describe: (row) => `${notificationKindLabels[row.kind]} due tomorrow`,
    },
    {
      key: "week",
      label: "Due This Week",
      variant: "warning",
      rows: nearDue.filter((row) => row.dueDate > tomorrow),
      describe: (row) =>
        `${notificationKindLabels[row.kind]} due ${formatDate(row.dueDate)}`,
    },
  ];

  return groups.filter((group) => group.rows.length);
};
