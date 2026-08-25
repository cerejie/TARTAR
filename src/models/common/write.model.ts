export type IQueuedWrite =
  | { id: string; label: string; kind: "insert"; table: string; values: unknown }
  | {
      id: string;
      label: string;
      kind: "update";
      table: string;
      values: unknown;
      match: Record<string, unknown>;
    }
  | {
      id: string;
      label: string;
      kind: "delete";
      table: string;
      match: Record<string, unknown>;
    }
  | {
      id: string;
      label: string;
      kind: "rpc";
      fn: string;
      args: Record<string, unknown>;
    };

type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

export type IQueuedWriteInput = DistributiveOmit<IQueuedWrite, "id">;
