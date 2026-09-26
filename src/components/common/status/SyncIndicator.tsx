import { CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useSyncStatus } from "../../../hook/common/network.hook";
import {
  syncBadge,
  syncOnline,
  syncOnlineDot,
  syncSpin,
} from "../../../styles/status/status.styles";

const SyncIndicator = () => {
  const { online, pending, flushing } = useSyncStatus();

  if (!online) {
    return (
      <TooltipTrigger>
        <Badge variant="outline" tabIndex={0} className={syncBadge({ state: "offline" })}>
          <WifiOff />
          Offline{pending ? ` · ${pending} pending` : ""}
        </Badge>
        <Tooltip>
          {pending
            ? `${pending} change(s) will sync when back online`
            : "You are offline"}
        </Tooltip>
      </TooltipTrigger>
    );
  }

  if (pending > 0 || flushing) {
    return (
      <TooltipTrigger>
        <Badge variant="outline" tabIndex={0} className={syncBadge({ state: "pending" })}>
          {flushing ? <RefreshCw className={syncSpin} /> : <CloudUpload />}
          {flushing ? "Syncing…" : `${pending} pending`}
        </Badge>
        <Tooltip>
          {flushing
            ? "Syncing queued changes…"
            : `${pending} change(s) waiting to sync`}
        </Tooltip>
      </TooltipTrigger>
    );
  }

  return (
    <TooltipTrigger>
      <span tabIndex={0} className={syncOnline}>
        <span className={syncOnlineDot} aria-hidden="true" />
        Online
      </span>
      <Tooltip>Online — all changes saved</Tooltip>
    </TooltipTrigger>
  );
};

export default SyncIndicator;
