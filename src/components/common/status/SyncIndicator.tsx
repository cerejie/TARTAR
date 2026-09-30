import { CloudAlert, CloudCheck, CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import { Dialog } from "react-aria-components";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.utils";
import { useSyncStatus } from "../../../hook/common/network.hook";
import {
  headerNotificationsDialog,
  headerNotificationsPopover,
} from "../../../styles/layout/header.styles";
import {
  countBadge,
  countButton,
  failedBadge,
  offlineDot,
  syncSpin,
} from "../../../styles/status/status.styles";
import AppButton from "../button/AppButton";
import SyncPanel from "./SyncPanel";

type IProps = {
  online: boolean;
  pending: number;
  failedCount: number;
  flushing: boolean;
};

const describeSync = ({ online, pending, failedCount, flushing }: IProps) => {
  if (failedCount > 0) return `${failedCount} change(s) could not sync`;
  if (!online) {
    return pending
      ? `Offline — ${pending} change(s) will sync when back online`
      : "You are offline";
  }
  if (flushing) return "Syncing queued changes…";
  if (pending > 0) return `${pending} change(s) waiting to sync`;
  return "Online — all changes saved";
};

const SyncIcon = ({ online, pending, failedCount, flushing }: IProps) => {
  if (!online) return <WifiOff />;
  if (flushing) return <RefreshCw className={syncSpin} />;
  if (failedCount > 0) return <CloudAlert />;
  if (pending > 0) return <CloudUpload />;
  return <CloudCheck />;
};

const SyncIndicator = () => {
  const status = useSyncStatus();
  const description = describeSync(status);
  const count = status.pending + status.failedCount;

  return (
    <PopoverTrigger>
      <AppButton
        variant="outline"
        size="icon"
        aria-label={description}
        className={countButton}
      >
        <SyncIcon {...status} />
        {count ? (
          <span className={cn(countBadge, status.failedCount > 0 && failedBadge)}>
            {count}
          </span>
        ) : null}
        {status.online ? null : <span className={offlineDot} aria-hidden="true" />}
      </AppButton>
      <Popover placement="bottom end" className={headerNotificationsPopover}>
        <Dialog aria-label="Sync status" className={headerNotificationsDialog}>
          <SyncPanel description={description} />
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default SyncIndicator;
