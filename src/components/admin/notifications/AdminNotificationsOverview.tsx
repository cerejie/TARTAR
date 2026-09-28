import { CheckCheck } from "lucide-react";
import { useAdminNotificationsHook } from "../../../hook/data/admin/admin.notifications.hook";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import { adminNotificationsBar } from "../../../styles/admin/admin.notifications.styles";
import SegmentedTabs from "../../common/app/SegmentedTabs";
import AppButton from "../../common/button/AppButton";
import NotificationFeed from "./NotificationFeed";

const AdminNotificationsOverview = () => {
  const notifications = useAdminNotificationsHook();

  return (
    <div className={adminTabStack}>
      <div className={adminNotificationsBar}>
        <SegmentedTabs
          label="Notifications view"
          value={notifications.segment}
          options={notifications.segmentOptions}
          onChange={notifications.setSegment}
        />
        <AppButton
          variant="outline"
          disabled={!notifications.unreadCount}
          onPress={notifications.markAllRead}
        >
          <CheckCheck />
          Mark all read
        </AppButton>
      </div>
      <NotificationFeed
        groups={notifications.groups}
        emptyText={notifications.emptyText}
        loading={notifications.loading}
        refreshing={notifications.refreshing}
        error={notifications.error}
        onRetry={notifications.retry}
        onOpen={notifications.openItem}
      />
    </div>
  );
};

export default AdminNotificationsOverview;
