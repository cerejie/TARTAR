import { cn } from "@/utils/cn.utils";
import type { IDueAlerts } from "../../models/data/dashboard/dashboard.response";
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
import { formatDate, formatMoney } from "../../utils/format.utils";
import { notificationGroups } from "../../utils/notification.utils";
import EmptyState from "../common/status/EmptyState";
import StatusTag from "../common/status/StatusTag";

const NOTIFICATION_CAP = 4;

type IProps = {
  data: IDueAlerts;
};

const NotificationsFeed = ({ data }: IProps) => {
  const visibleGroups = notificationGroups(data);

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
