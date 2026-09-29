import { Button as PressArea } from "react-aria-components";
import { cn } from "@/utils/cn.utils";
import { useNotificationListHook } from "../../hook/data/dashboard/notification.list.hook";
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
  notificationName,
  notificationSub,
  notificationText,
} from "../../styles/dashboard/dashboard.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import EmptyState from "../common/status/EmptyState";
import StatusTag from "../common/status/StatusTag";

import type { IDueAlerts } from "../../models/data/dashboard/dashboard.response";

type IProps = {
  data: IDueAlerts;
  onOpen?: () => void;
};

const NotificationsFeed = ({ data, onOpen }: IProps) => {
  const { groups, bankOf, openItem } = useNotificationListHook(data, onOpen);

  if (!groups.length) return <EmptyState description="Nothing overdue or due soon" />;

  return (
    <>
      {groups.map((group) => (
        <div key={group.key} className={notificationGroup}>
          <div className={cn(notificationGroupHead, toneText({ tone: group.variant }))}>
            <span>{group.label}</span>
            <StatusTag color={group.variant} label={group.rows.length} />
          </div>

          {group.rows.map((row) => {
            const bank = bankOf(row);

            return (
              <PressArea
                key={row.id}
                className={notificationItem}
                onPress={() => openItem(row)}
              >
                <div className={notificationItemMain}>
                  <span className={cn(notificationDot, toneFill({ tone: group.variant }))} />
                  <div className={notificationText}>
                    <span className={notificationName}>{row.name}</span>
                    <span className={notificationSub}>{group.describe(row)}</span>
                    {bank ? <span className={notificationSub}>Pay from {bank}</span> : null}
                  </div>
                </div>
                <div className={notificationFigures}>
                  <span className={notificationAmount({ tone: group.variant })}>
                    {formatMoney(row.amount)}
                  </span>
                  <span className={notificationDate}>{formatDate(row.dueDate)}</span>
                </div>
              </PressArea>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default NotificationsFeed;
