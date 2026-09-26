import {
  dueAlertCount,
  type IDueAlerts,
} from "../../models/data/dashboard/dashboard.response";
import { notificationFooter } from "../../styles/dashboard/dashboard.styles";
import AppButton from "../common/button/AppButton";
import SectionCard from "../common/card/SectionCard";
import EmptyState from "../common/status/EmptyState";
import StatusTag from "../common/status/StatusTag";
import NotificationsFeed from "./NotificationsFeed";

const PANEL_TITLE = "Notifications & Alerts";

type IProps = {
  data?: IDueAlerts;
  loading: boolean;
};

const NotificationsPanel = ({ data, loading }: IProps) => {
  if (loading || !data) {
    return (
      <SectionCard title={PANEL_TITLE}>
        <EmptyState description="Loading alerts" loading />
      </SectionCard>
    );
  }

  const totalCount = dueAlertCount(data);

  return (
    <SectionCard
      title={PANEL_TITLE}
      subtitle="Overdue and near-due items — next 7 days"
      extra={
        totalCount ? <StatusTag color="negative" label={totalCount} /> : null
      }
      footer={
        <div className={notificationFooter}>
          <AppButton variant="link" size="sm" href="/receivables">
            Receivables
          </AppButton>
          <AppButton variant="link" size="sm" href="/payables">
            Payables
          </AppButton>
        </div>
      }
    >
      <NotificationsFeed data={data} />
    </SectionCard>
  );
};

export default NotificationsPanel;
