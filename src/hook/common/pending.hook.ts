import { useMemo } from "react";
import { selectSessionOwner, useSyncStore } from "../../store/common/sync.store";
import { useAccountStore } from "../../store/data/account/account.store";
import { isOwnWrite, writeTargetsOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

type IPendingOptions<T> = {
  enabled: boolean;
  branch?: string | null;
  keyOf?: (row: T) => string;
};

const idKeyOf = (row: object): string => ("id" in row ? String(row.id) : "");

const branchOf = (row: object): unknown =>
  "branch" in row ? row.branch : undefined;

const useOwnQueue = (): readonly IQueuedWrite[] => {
  const owner = useAccountStore(selectSessionOwner);
  const queue = useSyncStore((state) => state.queue);

  return useMemo(() => queue.filter((write) => isOwnWrite(write, owner)), [owner, queue]);
};

export const usePendingIds = (): ReadonlySet<string> => {
  const queue = useOwnQueue();

  return useMemo(() => new Set(queue.flatMap(writeTargetsOf)), [queue]);
};

export const useWithPendingRows = <T extends object>(
  rows: readonly T[],
  toRow: (write: IQueuedWrite) => T | null,
  { enabled, branch, keyOf = idKeyOf }: IPendingOptions<T>
): readonly T[] => {
  const queue = useOwnQueue();

  if (!enabled) return rows;

  const loadedKeys = new Set(rows.map(keyOf));
  const inScope = (row: T) => {
    const rowBranch = branchOf(row);
    return !branch || !rowBranch || rowBranch === branch;
  };
  const pendingRows = queue
    .map(toRow)
    .filter((row): row is T => row !== null && !loadedKeys.has(keyOf(row)) && inScope(row))
    .reverse();

  return pendingRows.length > 0 ? [...pendingRows, ...rows] : rows;
};
