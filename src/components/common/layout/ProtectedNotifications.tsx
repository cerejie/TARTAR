import { Bell } from "lucide-react";
import { Dialog } from "react-aria-components";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useProtectedNotificationsHook } from "../../../hook/layout/protected.hook";
import {
  headerNotificationsBody,
  headerNotificationsDialog,
  headerNotificationsHead,
  headerNotificationsPopover,
} from "../../../styles/layout/header.styles";
import { countBadge, countButton } from "../../../styles/status/status.styles";
import NotificationsFeed from "../../dashboard/NotificationsFeed";
import AppButton from "../button/AppButton";
import EmptyState from "../status/EmptyState";

const ProtectedNotifications = () => {
  const { alerts, alertsLoading, alertCount } = useProtectedNotificationsHook();

  return (
    <PopoverTrigger>
      <AppButton
        variant="outline"
        size="icon"
        aria-label={`Notifications, ${alertCount} alerts`}
        className={countButton}
      >
        <Bell />
        {alertCount ? <span className={countBadge}>{alertCount}</span> : null}
      </AppButton>
      <Popover placement="bottom end" className={headerNotificationsPopover}>
        <Dialog
          aria-label="Notifications and alerts"
          className={headerNotificationsDialog}
        >
          <div className={headerNotificationsHead}>Notifications & Alerts</div>
          <div className={headerNotificationsBody}>
            {alertsLoading || !alerts ? (
              <EmptyState description="Loading alerts" loading />
            ) : (
              <NotificationsFeed data={alerts} />
            )}
          </div>
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default ProtectedNotifications;
