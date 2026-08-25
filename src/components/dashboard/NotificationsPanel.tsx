import { Badge, Empty, Flex, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import type { IDueAlerts } from "../../models/data/dashboard/dashboard.response";
import {
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import { tone } from "../../styles/common/tone.css";
import { colors } from "../../styles/common/vars.css";
import {
  notificationAmount,
  notificationCount,
  notificationDate,
  notificationDot,
  notificationEmpty,
  notificationFigures,
  notificationFooter,
  notificationGroup,
  notificationGroupHead,
  notificationItem,
  notificationItemMain,
  notificationMore,
  notificationName,
  notificationSub,
  notificationText,
} from "../../styles/view/dashboard/dashboard.view.css";
import { formatDate, formatMoney, todayIso } from "../../utils/format.utils";
import SectionCard from "../common/card/SectionCard";

const { Text } = Typography;

const NOTIFICATION_CAP = 4;

type NotificationKind = "receivable" | "payable";

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
  variant: "negative" | "warning";
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
  data?: IDueAlerts;
  loading: boolean;
};

const NotificationsPanel = ({ data, loading }: IProps) => {
  if (loading || !data) {
    return (
      <SectionCard title="Notifications & Alerts">
        <Flex className={`${notificationEmpty}`} align="center" justify="center">
          <Spin />
        </Flex>
      </SectionCard>
    );
  }

  const overdue = toRows(data.overdueReceivables, data.overduePayables);
  const nearDue = toRows(data.nearDueReceivables, data.nearDuePayables);

  const today = todayIso();
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const dueToday = nearDue.filter((row) => row.dueDate === today);
  const dueTomorrow = nearDue.filter((row) => row.dueDate === tomorrow);
  const dueLater = nearDue.filter((row) => row.dueDate > tomorrow);

  const totalCount =
    overdue.length + dueToday.length + dueTomorrow.length + dueLater.length;

  const groups: INotificationGroup[] = [
    {
      key: "overdue",
      label: "Overdue",
      variant: "negative",
      rows: overdue,
      describe: (row) => {
        const days = dayjs(today).diff(row.dueDate, "day");
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
    <SectionCard
      title="Notifications & Alerts"
      subtitle="Overdue and near-due items — next 7 days"
      extra={
        totalCount ? <Badge count={totalCount} color={colors.danger} /> : null
      }
    >
      {visibleGroups.length ? (
        visibleGroups.map((group) => (
          <Flex vertical key={group.key} className={`${notificationGroup}`}>
            <Flex
              className={`${notificationGroupHead} ${tone[group.variant]}`}
              align="center"
              gap={6}
            >
              <span>{group.label}</span>
              <Flex
                component="span"
                className={`${notificationCount} ${tone[group.variant]}`}
                align="center"
                justify="center"
              >
                {group.rows.length}
              </Flex>
            </Flex>

            {group.rows.slice(0, NOTIFICATION_CAP).map((row) => (
              <Flex
                key={row.id}
                className={`${notificationItem}`}
                align="flex-start"
                justify="space-between"
                gap={8}
              >
                <Flex
                  className={`${notificationItemMain}`}
                  align="flex-start"
                  gap={10}
                >
                  <span
                    className={`${notificationDot} ${tone[group.variant]}`}
                  />
                  <Flex vertical className={`${notificationText}`}>
                    <span className={`${notificationName}`}>{row.name}</span>
                    <span className={`${notificationSub}`}>
                      {group.describe(row)}
                    </span>
                  </Flex>
                </Flex>
                <Flex vertical className={`${notificationFigures}`}>
                  <span
                    className={`${notificationAmount} ${tone[group.variant]}`}
                  >
                    {formatMoney(row.amount)}
                  </span>
                  <span className={`${notificationDate}`}>
                    {formatDate(row.dueDate)}
                  </span>
                </Flex>
              </Flex>
            ))}

            {group.rows.length > NOTIFICATION_CAP ? (
              <Text type="secondary" className={`${notificationMore}`}>
                +{group.rows.length - NOTIFICATION_CAP} more
              </Text>
            ) : null}
          </Flex>
        ))
      ) : (
        <Empty
          className={`${notificationEmpty}`}
          description="Nothing overdue or due soon"
        />
      )}

      <Flex className={`${notificationFooter}`} justify="center">
        <Text type="secondary">
          <Link to="/receivables">Receivables</Link> ·{" "}
          <Link to="/payables">Payables</Link>
        </Text>
      </Flex>
    </SectionCard>
  );
};

export default NotificationsPanel;
