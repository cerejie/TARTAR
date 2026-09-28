import { BellOff } from "lucide-react";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import StatusTag from "../../common/status/StatusTag";

import type {
  IAdminNotification,
  IAdminNotificationGroup,
} from "../../../models/data/admin/admin.response";

type IProps = {
  groups: readonly IAdminNotificationGroup[];
  emptyText: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (item: IAdminNotification) => void;
};

const NotificationFeed = ({
  groups,
  emptyText,
  loading,
  refreshing,
  error,
  onRetry,
  onOpen,
}: IProps) => {
  if (loading || error || !groups.length) {
    return (
      <ListSection
        itemCount={groups.length}
        emptyText={emptyText}
        emptyIcon={<BellOff />}
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {null}
      </ListSection>
    );
  }

  return (
    <div className={adminTabStack}>
      {groups.map((group) => (
        <ListSection
          key={group.key}
          title={group.label}
          meta={<StatusTag label={group.items.length} color={group.tone} />}
          itemCount={group.items.length}
          emptyText={emptyText}
          refreshing={refreshing}
        >
          {group.items.map((item) => (
            <ListCard
              key={item.id}
              name={item.name}
              meta={item.description}
              amount={item.amount}
              badge={item.unread ? <StatusTag label="New" color="brand" /> : null}
              onPress={() => onOpen(item)}
            />
          ))}
        </ListSection>
      ))}
    </div>
  );
};

export default NotificationFeed;
