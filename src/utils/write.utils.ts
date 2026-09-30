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

const isReplayedInsert = (write: IQueuedWrite, result: IPostgrestResult) =>
  write.kind === "insert" &&
  result.error?.code === uniqueViolationCode &&
  result.error.message.includes(`${write.table}_pkey`);

const toWriteError = (result: IPostgrestResult): WriteError => {
  const message = toError(result.error).message;
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
  if (result.error) throw toWriteError(result);

  const matched = write.kind === "update" || write.kind === "delete";
  if (matched && Array.isArray(result.data) && result.data.length === 0) {
    throw new WriteError(
      "refused",
      `${write.label} changed nothing — the record is gone or you lack permission for it.`
    );
  }
};

const newWriteId = (): string => crypto.randomUUID();

const withRecordId = (values: unknown): unknown => {
  if (!values || typeof values !== "object" || Array.isArray(values)) return values;
  if ("id" in values && values.id) return values;
  return { id: newWriteId(), ...values };
};

export const isOwnWrite = (write: IQueuedWrite, owner: string | null): boolean =>
  !write.owner || write.owner === owner;

export const prepareWrite = (
  write: IQueuedWriteInput,
  owner: string | null
): IQueuedWrite => {
  const id = newWriteId();

  if (write.kind === "insert") {
    return { ...write, id, owner, values: withRecordId(write.values) };
  }
  if (write.kind === "rpc" && idempotentRpcs.has(write.fn)) {
    return { ...write, id, owner, args: { p_idempotency_key: id, ...write.args } };
  }
  return { ...write, id, owner };
};
