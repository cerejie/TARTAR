import {
  dueAlertCount,
  type IDueAlerts,
} from "../../models/data/dashboard/dashboard.response";
import {
  notificationScroll,
  notificationScrollFrame,
} from "../../styles/dashboard/dashboard.styles";
import SectionCard from "../common/card/SectionCard";
import EmptyState from "../common/status/EmptyState";
import StatusTag from "../common/status/StatusTag";
import NotificationsFeed from "./NotificationsFeed";

type IProps = {
  data?: IDueAlerts;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
};

const NotificationsCard = ({ data, loading, error, onRetry }: IProps) => {
  const totalCount = data ? dueAlertCount(data) : 0;

  return (
    <SectionCard
      title="Notifications & Alerts"
      extra={
        totalCount ? <StatusTag color="negative" label={totalCount} /> : null
      }
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      {data ? (
        <div className={notificationScrollFrame}>
          <div className={notificationScroll}>
            <NotificationsFeed data={data} />
          </div>
        </div>
      ) : (
        <EmptyState description="Nothing overdue or due soon" />
      )}
    </SectionCard>
  );
};

export default NotificationsCard;
