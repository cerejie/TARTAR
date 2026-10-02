import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAccountStore } from "../../store/data/account/account.store";
import { selectOnline, useNetworkStore } from "../../store/common/network.store";
import {
  selectHasUnsavedWatched,
  selectOfflineSavedAt,
  useQueryStore,
} from "../../store/common/query.store";
import {
  rehydrateSync,
  selectSessionOwner,
  useSyncStore,
} from "../../store/common/sync.store";
import { syncStorageKey } from "../../keys/storage.keys";
import { formatChangeCount, formatDateTime } from "../../utils/format.utils";
import { isOwnWrite } from "../../utils/write.utils";
import { useConfirm } from "./confirmation.hook";
import type { IQueuedWrite } from "../../models/common/write.model";

const retryIntervalMs = 30_000;

const flushWhenWaiting = () => {
  const { queue, flushing } = useSyncStore.getState();
  if (navigator.onLine && !flushing && queue.length > 0) void flushAndReport();
};

const syncFromOtherTab = (event: StorageEvent) => {
  if (event.key === syncStorageKey) rehydrateSync();
};

const flushAndReport = async (): Promise<void> => {
  const { synced, failed } = await useSyncStore.getState().flush();
  if (synced === 0 && failed === 0) return;

  useQueryStore.getState().refetchAll();
  if (synced > 0) toast.success(`Synced ${formatChangeCount(synced)}`);
  if (failed > 0) {
    toast.error(`${formatChangeCount(failed)} could not sync`, {
      description: "Open the sync panel to retry or discard them.",
    });
  }
};

export const useNetwork = () => {
  const setOnline = useNetworkStore((state) => state.setOnline);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      void flushAndReport();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("storage", syncFromOtherTab);

    if (navigator.onLine) void flushAndReport();
    const retryTimer = window.setInterval(flushWhenWaiting, retryIntervalMs);

    return () => {
      window.clearInterval(retryTimer);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("storage", syncFromOtherTab);
    };
  }, [setOnline]);
};

const useOwnWrites = () => {
  const owner = useAccountStore(selectSessionOwner);
  const queue = useSyncStore((state) => state.queue);
  const failed = useSyncStore((state) => state.failed);

  return useMemo(() => {
    const pendingWrites = queue.filter((write) => isOwnWrite(write, owner));
    return {
      pendingWrites,
      failedWrites: failed.filter((item) => isOwnWrite(item.write, owner)),
      othersWaiting: queue.length - pendingWrites.length,
    };
  }, [owner, queue, failed]);
};

type ISyncCounts = {
  online: boolean;
  flushing: boolean;
  pending: number;
  failedCount: number;
};

const describeSync = ({ online, flushing, pending, failedCount }: ISyncCounts): string => {
  if (failedCount > 0) return `${formatChangeCount(failedCount)} could not sync`;
  if (!online) {
    return pending
      ? `Offline — ${formatChangeCount(pending)} will sync when back online`
      : "You are offline";
  }
  if (flushing) return "Syncing queued changes…";
  if (pending > 0) return `${formatChangeCount(pending)} waiting to sync`;
  return "Online — all changes saved";
};

export const useIsOnline = () => useNetworkStore(selectOnline);

export const useSyncStatus = () => {
  const online = useNetworkStore((state) => state.online);
  const flushing = useSyncStore((state) => state.flushing);
  const { pendingWrites, failedWrites } = useOwnWrites();
  const counts: ISyncCounts = {
    online,
    flushing,
    pending: pendingWrites.length,
    failedCount: failedWrites.length,
  };

  return { ...counts, description: describeSync(counts) };
};

const offlineTitleOf = (savedAt: number, partlyUnsaved: boolean): string => {
  if (partlyUnsaved) return "Offline — this page was not saved for offline";
  if (savedAt === 0) return "Offline";
  return `Offline — showing data saved ${formatDateTime(new Date(savedAt).toISOString())}`;
};

export const useOfflineNotice = () => {
  const online = useNetworkStore((state) => state.online);
  const savedAt = useQueryStore(selectOfflineSavedAt);
  const partlyUnsaved = useQueryStore(selectHasUnsavedWatched);

  return {
    visible: !online,
    title: offlineTitleOf(savedAt, partlyUnsaved),
  };
};

export const useSyncPanelHook = () => {
  const online = useNetworkStore((state) => state.online);
  const flushing = useSyncStore((state) => state.flushing);
  const retry = useSyncStore((state) => state.retry);
  const discard = useSyncStore((state) => state.discard);
  const openConfirm = useConfirm();
  const { pendingWrites, failedWrites, othersWaiting } = useOwnWrites();

  const handleRetry = (write: IQueuedWrite) => {
    retry(write.id);
    if (online) void flushAndReport();
  };

  const handleDiscard = (write: IQueuedWrite) =>
    openConfirm({
      kind: "delete",
      title: `Discard "${write.label}"?`,
      message: "This change was never saved to the database and will be lost.",
      okText: "Discard",
      onConfirm: () => discard(write.id),
    });

  return {
    online,
    flushing,
    pendingWrites,
    failedWrites,
    othersWaiting,
    handleRetry,
    handleDiscard,
  };
};
