import { CircleAlert, Clock, CloudCheck, RotateCcw, Trash2 } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useSyncPanelHook } from "../../../hook/common/network.hook";
import {
  headerNotificationsBody,
  headerNotificationsHead,
} from "../../../styles/layout/header.styles";
import {
  syncFailedIcon,
  syncHeadHint,
  syncPendingIcon,
  syncReason,
  syncSection,
  syncSectionTitle,
} from "../../../styles/status/status.styles";
import { formatDateTime } from "../../../utils/format.utils";
import AppButton from "../button/AppButton";
import EmptyState from "./EmptyState";

type IProps = {
  description: string;
};

const SyncPanel = ({ description }: IProps) => {
  const {
    online,
    flushing,
    pendingWrites,
    failedWrites,
    othersWaiting,
    handleRetry,
    handleDiscard,
  } = useSyncPanelHook();

  const isEmpty = pendingWrites.length === 0 && failedWrites.length === 0;

  return (
    <>
      <div className={headerNotificationsHead}>
        Sync
        <span className={syncHeadHint}>{description}</span>
      </div>
      <div className={headerNotificationsBody}>
        {isEmpty ? (
          <EmptyState icon={<CloudCheck />} description="Every change is saved." />
        ) : null}

        {failedWrites.length > 0 ? (
          <section className={syncSection}>
            <span className={syncSectionTitle}>
              Needs attention ({failedWrites.length})
            </span>
            {failedWrites.map(({ write, reason, failedAt }) => (
              <Item key={write.id} variant="outline" size="sm">
                <ItemMedia variant="icon" className={syncFailedIcon}>
                  <CircleAlert />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{write.label}</ItemTitle>
                  <ItemDescription className={syncReason}>{reason}</ItemDescription>
                  <ItemDescription>
                    {formatDateTime(new Date(failedAt).toISOString())}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <AppButton
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Retry ${write.label}`}
                    disabled={!online || flushing}
                    onPress={() => handleRetry(write)}
                  >
                    <RotateCcw />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Discard ${write.label}`}
                    onPress={() => handleDiscard(write)}
                  >
                    <Trash2 />
                  </AppButton>
                </ItemActions>
              </Item>
            ))}
          </section>
        ) : null}

        {pendingWrites.length > 0 ? (
          <section className={syncSection}>
            <span className={syncSectionTitle}>
              Waiting to sync ({pendingWrites.length})
            </span>
            {pendingWrites.map((write) => (
              <Item key={write.id} variant="outline" size="sm">
                <ItemMedia variant="icon" className={syncPendingIcon}>
                  <Clock />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{write.label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <AppButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Discard ${write.label}`}
                    disabled={flushing}
                    onPress={() => handleDiscard(write)}
                  >
                    <Trash2 />
                  </AppButton>
                </ItemActions>
              </Item>
            ))}
          </section>
        ) : null}

        {othersWaiting > 0 ? (
          <span className={syncSectionTitle}>
            {othersWaiting} change(s) waiting for another user to sign in on this device
          </span>
        ) : null}
      </div>
    </>
  );
};

export default SyncPanel;
