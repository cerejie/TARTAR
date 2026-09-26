import { CloudCheck, CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import { useSyncStatus } from "../../../hook/common/network.hook";
import {
  countBadge,
  countButton,
  offlineDot,
  syncSpin,
} from "../../../styles/status/status.styles";
import AppButton from "../button/AppButton";

type IProps = {
  online: boolean;
  pending: number;
  flushing: boolean;
};

const describeSync = (online: boolean, pending: number, flushing: boolean) => {
  if (!online) {
    return pending
      ? `Offline — ${pending} change(s) will sync when back online`
      : "You are offline";
  }
  if (flushing) return "Syncing queued changes…";
  if (pending > 0) return `${pending} change(s) waiting to sync`;
  return "Online — all changes saved";
};

const SyncIcon = ({ online, pending, flushing }: IProps) => {
  if (!online) return <WifiOff />;
  if (flushing) return <RefreshCw className={syncSpin} />;
  if (pending > 0) return <CloudUpload />;
  return <CloudCheck />;
};

const SyncIndicator = () => {
  const { online, pending, flushing } = useSyncStatus();
  const description = describeSync(online, pending, flushing);

  return (
    <AppButton
      variant="outline"
      size="icon"
      aria-label={description}
      tooltip={description}
      className={countButton}
    >
      <SyncIcon online={online} pending={pending} flushing={flushing} />
      {pending ? <span className={countBadge}>{pending}</span> : null}
      {online ? null : <span className={offlineDot} aria-hidden="true" />}
    </AppButton>
  );
};

export default SyncIndicator;
