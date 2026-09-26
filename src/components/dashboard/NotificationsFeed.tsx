import { cn } from "@/utils/cn.utils";
import type { IDueAlerts } from "../../models/data/dashboard/dashboard.response";
import {
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import { toneFill, toneText } from "../../styles/common/tone.styles";
import {
  notificationAmount,
  notificationDate,
  notificationDot,
  notificationFigures,
  notificationGroup,
  notificationGroupHead,
  notificationItem,
  notificationItemMain,
  notificationMore,
  notificationName,
  notificationSub,
  notificationText,
} from "../../styles/dashboard/dashboard.styles";
import {
  addDaysIso,
  daysBetween,
  formatDate,
  formatMoney,
  todayIso,
} from "../../utils/format.utils";
import EmptyState from "../common/status/EmptyState";
import StatusTag from "../common/status/StatusTag";

const NOTIFICATION_CAP = 4;

type NotificationKind = "receivable" | "payable";

type NotificationTone = "negative" | "warning";

interface INotificationRow {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  kind: NotificationKind;
}

interface INotificationGroup {
  key: string;
  label: string;
  variant: NotificationTone;
  rows: INotificationRow[];
  describe: (row: INotificationRow) => string;
}

const ledgerLabel = (kind: NotificationKind) =>
  kind === "receivable" ? "Receivable" : "Payable";

const toRows = (
  receivables: IReceivable[],
  payables: IPayable[]
): INotificationRow[] =>
  [
    ...receivables.map((row) => ({
      id: `r-${row.id}`,
      name: row.customer_name,
      amount: ledgerBalance(row),
      dueDate: row.due_date,
      kind: "receivable" as const,
    })),
    ...payables.map((row) => ({
      id: `p-${row.id}`,
      name: row.supplier_name,
      amount: ledgerBalance(row),
      dueDate: row.due_date,
      kind: "payable" as const,
    })),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

type IProps = {
  data: IDueAlerts;
};

const NotificationsFeed = ({ data }: IProps) => {
  const overdue = toRows(data.overdueReceivables, data.overduePayables);
  const nearDue = toRows(data.nearDueReceivables, data.nearDuePayables);

  const today = todayIso();
  const tomorrow = addDaysIso(1);
  const dueToday = nearDue.filter((row) => row.dueDate === today);
  const dueTomorrow = nearDue.filter((row) => row.dueDate === tomorrow);
  const dueLater = nearDue.filter((row) => row.dueDate > tomorrow);

  const groups: INotificationGroup[] = [
    {
      key: "overdue",
      label: "Overdue",
      variant: "negative",
      rows: overdue,
      describe: (row) => {
        const days = daysBetween(row.dueDate, today);
        return `${ledgerLabel(row.kind)} overdue by ${days} day${
          days === 1 ? "" : "s"
        }`;
      },
    },
    {
      key: "today",
      label: "Due Today",
      variant: "warning",
      rows: dueToday,
      describe: (row) => `${ledgerLabel(row.kind)} due today`,
    },
    {
      key: "tomorrow",
      label: "Due Tomorrow",
      variant: "warning",
      rows: dueTomorrow,
      describe: (row) => `${ledgerLabel(row.kind)} due tomorrow`,
    },
    {
      key: "week",
      label: "Due This Week",
      variant: "warning",
      rows: dueLater,
      describe: (row) =>
        `${ledgerLabel(row.kind)} due ${formatDate(row.dueDate)}`,
    },
  ];

  const visibleGroups = groups.filter((group) => group.rows.length);

  return (
    <>
      {visibleGroups.length ? (
        visibleGroups.map((group) => (
          <div key={group.key} className={notificationGroup}>
            <div
              className={cn(
                notificationGroupHead,
                toneText({ tone: group.variant })
              )}
            >
              <span>{group.label}</span>
              <StatusTag color={group.variant} label={group.rows.length} />
            </div>

            {group.rows.slice(0, NOTIFICATION_CAP).map((row) => (
              <div key={row.id} className={notificationItem}>
                <div className={notificationItemMain}>
                  <span
                    className={cn(
                      notificationDot,
                      toneFill({ tone: group.variant })
                    )}
                  />
                  <div className={notificationText}>
                    <span className={notificationName}>{row.name}</span>
                    <span className={notificationSub}>
                      {group.describe(row)}
                    </span>
                  </div>
                </div>
                <div className={notificationFigures}>
                  <span className={notificationAmount({ tone: group.variant })}>
                    {formatMoney(row.amount)}
                  </span>
                  <span className={notificationDate}>
                    {formatDate(row.dueDate)}
                  </span>
                </div>
              </div>
            ))}

            {group.rows.length > NOTIFICATION_CAP ? (
              <span className={notificationMore}>
                +{group.rows.length - NOTIFICATION_CAP} more
              </span>
            ) : null}
          </div>
        ))
      ) : (
        <EmptyState description="Nothing overdue or due soon" />
      )}
    </>
  );
};

export default NotificationsFeed;
