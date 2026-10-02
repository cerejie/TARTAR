import { CloudAlert, CloudCheck, CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import { Dialog } from "react-aria-components";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/cn.utils";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { useSyncStatus } from "../../../hook/common/network.hook";
import { syncSheetModalKey } from "../../../keys/modal.keys";
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
import AppSheet from "../app/AppSheet";
import AppButton from "../button/AppButton";
import SyncPanel from "./SyncPanel";

type IProps = {
  online: boolean;
  pending: number;
  failedCount: number;
  flushing: boolean;
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
  const { description } = status;
  const count = status.pending + status.failedCount;
  const isCompact = useIsCompact();
  const sheet = useModal(syncSheetModalKey);

  const button = (
    <AppButton
      variant="outline"
      size="icon"
      aria-label={description}
      className={countButton}
      onPress={isCompact ? () => sheet.openModal() : undefined}
    >
      <SyncIcon {...status} />
      {count ? (
        <span className={cn(countBadge, status.failedCount > 0 && failedBadge)}>
          {count}
        </span>
      ) : null}
      {status.online ? null : <span className={offlineDot} aria-hidden="true" />}
    </AppButton>
  );

  if (isCompact) {
    return (
      <>
        {button}
        <AppSheet
          open={sheet.modal.visible}
          title="Sync"
          description={description}
          onClose={sheet.closeModal}
        >
          <SyncPanel description={description} withHeading={false} />
        </AppSheet>
      </>
    );
  }

  return (
    <PopoverTrigger>
      {button}
      <Popover placement="bottom end" className={headerNotificationsPopover}>
        <Dialog aria-label="Sync status" className={headerNotificationsDialog}>
          <SyncPanel description={description} />
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default SyncIndicator;
