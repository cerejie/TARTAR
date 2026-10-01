import { useAlertsSheetHook } from "../../../hook/layout/protected.phone.hook";
import NotificationsFeed from "../../dashboard/NotificationsFeed";
import AppSheet from "../app/AppSheet";
import EmptyState from "../status/EmptyState";

const PhoneAlertsSheet = () => {
  const { open, close, alerts, alertsLoading } = useAlertsSheetHook();

  return (
    <AppSheet open={open} title="Notifications & Alerts" onClose={close}>
      {alertsLoading || !alerts ? (
        <EmptyState description="Loading alerts" loading />
      ) : (
        <NotificationsFeed data={alerts} />
      )}
    </AppSheet>
  );
};

export default PhoneAlertsSheet;
