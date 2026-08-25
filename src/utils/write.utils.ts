import type { IQueuedWrite } from "../models/common/write.model";
import { supabase, toError } from "./supabase.utils";

export const executeWrite = async (write: IQueuedWrite): Promise<void> => {
  const run = async () => {
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

  const { data, error } = await run();
  if (error) throw toError(error);

  const matched = write.kind === "update" || write.kind === "delete";
  if (matched && Array.isArray(data) && data.length === 0) {
    throw new Error(
      `${write.label} changed nothing — the record is gone or you lack permission for it.`
    );
  }
};

let counter = 0;

export const newWriteId = (): string => {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
};
