import { CheckCheck } from "lucide-react";
import { useAdminNotificationsHook } from "../../../hook/data/admin/admin.notifications.hook";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import SegmentedTabs from "../../common/app/SegmentedTabs";
import AppButton from "../../common/button/AppButton";
import AdminPageTitle from "../../common/layout/AdminPageTitle";
import InboxFeed from "../../inbox/lists/InboxFeed";
import NotificationFeed from "./NotificationFeed";

const AdminNotificationsOverview = () => {
  const notifications = useAdminNotificationsHook();

  return (
    <div className={adminTabStack}>
      <AdminPageTitle
        action={
          <AppButton
            variant="ghost"
            size="sm"
            disabled={!notifications.unreadCount}
            onPress={notifications.markAllRead}
          >
            <CheckCheck />
            Mark all read
          </AppButton>
        }
      />
      <InboxFeed section="action" />
      <SegmentedTabs
        label="Due alerts view"
        value={notifications.segment}
        options={notifications.segmentOptions}
        onChange={notifications.setSegment}
      />
      <NotificationFeed
        groups={notifications.groups}
        emptyText={notifications.emptyText}
        loading={notifications.loading}
        refreshing={notifications.refreshing}
        error={notifications.error}
        onRetry={notifications.retry}
        onOpen={notifications.openItem}
      />
      <InboxFeed section="updates" markAll={false} />
    </div>
  );
};

export default AdminNotificationsOverview;
