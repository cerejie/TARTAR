type IWriteBase = {
  id: string;
  label: string;
  owner: string | null;
  queuedAt?: number;
};

export type IQueuedWrite =
  | (IWriteBase & { kind: "insert"; table: string; values: unknown })
  | (IWriteBase & {
      kind: "update";
      table: string;
      values: unknown;
      match: Record<string, unknown>;
    })
  | (IWriteBase & {
      kind: "delete";
      table: string;
      match: Record<string, unknown>;
    })
  | (IWriteBase & {
      kind: "rpc";
      fn: string;
      args: Record<string, unknown>;
    });

export interface IFailedWrite {
  write: IQueuedWrite;
  reason: string;
  failedAt: number;
}

export type WriteFailureKind = "network" | "session" | "refused";

export interface IFlushResult {
  synced: number;
  failed: number;
}

type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

export type IQueuedWriteInput = DistributiveOmit<IQueuedWrite, "id" | "owner">;
