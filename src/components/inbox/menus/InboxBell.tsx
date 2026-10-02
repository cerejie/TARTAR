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
  dueCount?: number;
};

const InboxBell = ({ onPress, dueCount = 0 }: IProps) => {
  const { attentionCount } = useInboxListHook();
  const count = attentionCount + dueCount;
  const label = count ? `Notifications, ${count} new` : "Notifications";

  const button = (
    <AppButton
      variant="outline"
      size="icon"
      aria-label={label}
      className={countButton}
      onPress={onPress}
    >
      <Bell />
      {count ? <span className={countBadge}>{count}</span> : null}
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
