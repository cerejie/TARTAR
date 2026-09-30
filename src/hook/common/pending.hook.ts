import { useMemo } from "react";
import { useSyncStore } from "../../store/common/sync.store";
import { writeTargetsOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

type IPendingRow = { id: string; branch: string };

type IPendingOptions = {
  enabled: boolean;
  branch?: string | null;
};

export const usePendingIds = (): ReadonlySet<string> => {
  const queue = useSyncStore((state) => state.queue);

  return useMemo(() => new Set(queue.flatMap(writeTargetsOf)), [queue]);
};

export const useWithPendingRows = <T extends IPendingRow>(
  rows: readonly T[],
  toRow: (write: IQueuedWrite) => T | null,
  { enabled, branch }: IPendingOptions
): readonly T[] => {
  const queue = useSyncStore((state) => state.queue);

  if (!enabled) return rows;

  const loadedIds = new Set(rows.map((row) => row.id));
  const inScope = (row: T) => !branch || !row.branch || row.branch === branch;
  const pendingRows = queue
    .map(toRow)
    .filter((row): row is T => row !== null && !loadedIds.has(row.id) && inScope(row))
    .reverse();

  return pendingRows.length > 0 ? [...pendingRows, ...rows] : rows;
};
