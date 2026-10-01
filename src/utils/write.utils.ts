import type {
  IQueuedWrite,
  IQueuedWriteInput,
  WriteFailureKind,
} from "../models/common/write.model";
import { supabase, toError } from "./supabase.utils";

const networkStatus = 0;
const unauthorizedStatus = 401;
const uniqueViolationCode = "23505";

const idempotentRpcs: ReadonlySet<string> = new Set([
  "create_transaction_with_voucher",
  "record_ledger_payment",
  "mark_payable_paid",
  "mark_sale_deposited",
  "verify_sale",
  "reject_sale",
  "verify_payment",
  "reject_payment",
]);

export class WriteError extends Error {
  readonly kind: WriteFailureKind;

  constructor(kind: WriteFailureKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export const failureKindOf = (error: unknown): WriteFailureKind => {
  if (error instanceof WriteError) return error.kind;
  if (error instanceof TypeError) return "network";
  return "refused";
};

export const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

type IPostgrestResult = {
  data: unknown;
  error: { code?: string; message: string } | null;
  status: number;
};

const hasStampedId = (values: unknown): boolean =>
  !!values && typeof values === "object" && "id" in values && !!values.id;

const isReplayedInsert = (write: IQueuedWrite, result: IPostgrestResult) =>
  write.kind === "insert" &&
  hasStampedId(write.values) &&
  result.error?.code === uniqueViolationCode &&
  result.error.message.includes(`${write.table}_pkey`);

const toWriteError = (
  write: IQueuedWrite,
  result: IPostgrestResult
): WriteError => {
  const code = result.error?.code ?? "";
  const message = write.errors?.[code] ?? toError(result.error).message;
  if (result.status === networkStatus) return new WriteError("network", message);
  if (result.status === unauthorizedStatus) return new WriteError("session", message);
  return new WriteError("refused", message);
};

export const executeWrite = async (write: IQueuedWrite): Promise<void> => {
  const run = async (): Promise<IPostgrestResult> => {
    switch (write.kind) {
      case "insert":
        return supabase.from(write.table).insert(write.values as never);
      case "update":
        return supabase
          .from(write.table)
          .update(write.values as never)
          .match(write.match)
          .select();
      case "delete":
        return supabase.from(write.table).delete().match(write.match).select();
      case "rpc":
        return supabase.rpc(write.fn, write.args);
    }
  };

  const result = await run();
  if (isReplayedInsert(write, result)) return;
  if (result.error) throw toWriteError(write, result);

  const matched = write.kind === "update" || write.kind === "delete";
  if (matched && Array.isArray(result.data) && result.data.length === 0) {
    throw new WriteError("refused", unmatchedReasonOf(write));
  }
};

const unmatchedReasonOf = (write: IQueuedWrite): string =>
  write.kind === "update" && "version" in write.match
    ? `${write.label} was refused — someone else changed this record after you opened it. Reopen it and edit again.`
    : `${write.label} changed nothing — the record is gone or you lack permission for it.`;

const newWriteId = (): string => crypto.randomUUID();

const withRecordId = (values: unknown): unknown => {
  if (!values || typeof values !== "object" || Array.isArray(values)) return values;
  if (hasStampedId(values) || "slug" in values) return values;
  return { id: newWriteId(), ...values };
};

type IRecordValues = Record<string, unknown>;

const isRecordValues = (value: unknown): value is IRecordValues =>
  !!value && typeof value === "object" && !Array.isArray(value);

export const queuedInsertOf = (
  write: IQueuedWrite,
  table: string
): IRecordValues | null =>
  write.kind === "insert" && write.table === table && isRecordValues(write.values)
    ? write.values
    : null;

export const queuedRpcArgsOf = (
  write: IQueuedWrite,
  fn: string
): IRecordValues | null =>
  write.kind === "rpc" && write.fn === fn ? write.args : null;

export const queuedAtOf = (write: IQueuedWrite): string =>
  new Date(write.queuedAt ?? Date.now()).toISOString();

const recordArgs = ["p_transaction_id", "p_payment_id", "p_payable_id"] as const;

const stringsOf = (values: readonly unknown[]): string[] =>
  values.filter((value): value is string => typeof value === "string");

const idOf = (record: unknown): unknown =>
  record && typeof record === "object" && "id" in record ? record.id : undefined;

const slugOf = (record: unknown): unknown =>
  record && typeof record === "object" && "slug" in record ? record.slug : undefined;

const allocationTargetsOf = (allocations: unknown): unknown[] =>
  Array.isArray(allocations)
    ? allocations.map((allocation: unknown) =>
        allocation && typeof allocation === "object" && "ledger_id" in allocation
          ? allocation.ledger_id
          : undefined
      )
    : [];

export const writeTargetsOf = (write: IQueuedWrite): string[] => {
  switch (write.kind) {
    case "insert":
      return stringsOf([idOf(write.values), slugOf(write.values)]);
    case "update":
    case "delete":
      return stringsOf([write.match.id, write.match.slug]);
    case "rpc":
      return stringsOf([
        write.id,
        ...recordArgs.map((arg) => write.args[arg]),
        ...allocationTargetsOf(write.args.p_allocations),
      ]);
  }
};

export const isOwnWrite = (write: IQueuedWrite, owner: string | null): boolean =>
  !write.owner || write.owner === owner;

export const prepareWrite = (
  write: IQueuedWriteInput,
  owner: string | null
): IQueuedWrite => {
  const id = newWriteId();
  const queuedAt = Date.now();

  if (write.kind === "insert") {
    return { ...write, id, owner, queuedAt, values: withRecordId(write.values) };
  }
  if (write.kind === "rpc" && idempotentRpcs.has(write.fn)) {
    return {
      ...write,
      id,
      owner,
      queuedAt,
      args: { p_idempotency_key: id, ...write.args },
    };
  }
  return { ...write, id, owner, queuedAt };
};
