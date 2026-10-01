import { Bell } from "lucide-react";
import { Dialog } from "react-aria-components";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useInboxListHook } from "../../../hook/data/inbox/inbox.list.hook";
import {
  headerInboxBody,
  headerNotificationsDialog,
  headerNotificationsPopover,
} from "../../../styles/layout/header.styles";
import { countBadge, countButton } from "../../../styles/status/status.styles";
import AppButton from "../../common/button/AppButton";
import InboxFeed from "../lists/InboxFeed";

type IProps = {
  onPress?: () => void;
};

const InboxBell = ({ onPress }: IProps) => {
  const { unreadCount } = useInboxListHook();
  const label = unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications";

  const button = (
    <AppButton
      variant="outline"
      size="icon"
      aria-label={label}
      className={countButton}
      onPress={onPress}
    >
      <Bell />
      {unreadCount ? <span className={countBadge}>{unreadCount}</span> : null}
    </AppButton>
  );

  if (onPress) return button;

  return (
    <PopoverTrigger>
      {button}
      <Popover placement="bottom end" className={headerNotificationsPopover}>
        <Dialog aria-label="Notifications" className={headerNotificationsDialog}>
          {({ close }) => (
            <div className={headerInboxBody}>
              <InboxFeed onOpen={close} />
            </div>
          )}
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default InboxBell;
