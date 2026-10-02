import { useNotificationCenterHook } from "../../../hook/layout/protected.hook";
import { inboxStack } from "../../../styles/app/app.styles";
import EmptyState from "../../common/status/EmptyState";
import NotificationsFeed from "../../dashboard/NotificationsFeed";
import InboxFeed from "./InboxFeed";

type IProps = {
  onOpen?: () => void;
};

const NotificationCenter = ({ onOpen }: IProps) => {
  const { showAlerts, alerts, alertsLoading } = useNotificationCenterHook();

  const renderAlerts = () => {
    if (!showAlerts) return null;
    if (alertsLoading || !alerts) return <EmptyState description="Loading alerts" loading />;
    return <NotificationsFeed data={alerts} onOpen={onOpen} />;
  };

  return (
    <div className={inboxStack}>
      <InboxFeed section="action" onOpen={onOpen} />
      {renderAlerts()}
      <InboxFeed section="updates" onOpen={onOpen} />
    </div>
  );
};

export default NotificationCenter;
