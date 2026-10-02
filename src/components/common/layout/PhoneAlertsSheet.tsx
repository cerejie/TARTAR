import { useAlertsSheetHook } from "../../../hook/layout/protected.phone.hook";
import { inboxStack } from "../../../styles/app/app.styles";
import NotificationsFeed from "../../dashboard/NotificationsFeed";
import InboxFeed from "../../inbox/lists/InboxFeed";
import AppSheet from "../app/AppSheet";
import EmptyState from "../status/EmptyState";
import PushPromptNotice from "../status/PushPromptNotice";

const PhoneAlertsSheet = () => {
  const { open, close, title, showAlerts, alerts, alertsLoading } = useAlertsSheetHook();

  return (
    <AppSheet open={open} title={title} onClose={close}>
      <PushPromptNotice />
      <div className={inboxStack}>
        <InboxFeed onOpen={close} />
        {showAlerts && alerts && !alertsLoading ? <NotificationsFeed data={alerts} /> : null}
        {showAlerts && (alertsLoading || !alerts) ? (
          <EmptyState description="Loading alerts" loading />
        ) : null}
      </div>
    </AppSheet>
  );
};

export default PhoneAlertsSheet;
