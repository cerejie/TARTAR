import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  IQueuedWrite,
  IQueuedWriteInput,
} from "../models/common/write.model";
import {
  executeWrite,
  failureKindOf,
  isOwnWrite,
  messageOf,
  prepareWrite,
  queuedAtOf,
  queuedInsertOf,
  queuedRpcArgsOf,
  WriteError,
  writeTargetsOf,
} from "./write.utils";

type IServerResult = {
  data: unknown;
  error: { code?: string; message: string } | null;
  status: number;
};

const server = vi.hoisted(() => ({
  writeResult: { data: null, error: null, status: 200 } as IServerResult,
  lookupResult: { data: [], error: null, status: 200 } as IServerResult,
  lookups: [] as Record<string, unknown>[],
}));

vi.mock("./supabase.utils", () => {
  const matched = () => ({ select: async () => server.writeResult });

  return {
    supabase: {
      from: () => ({
        insert: async () => server.writeResult,
        update: () => ({ match: matched }),
        delete: () => ({ match: matched }),
        select: () => ({
          match: (match: Record<string, unknown>) => {
            server.lookups.push(match);
            return { limit: async () => server.lookupResult };
          },
        }),
      }),
      rpc: async () => server.writeResult,
    },
    toError: (error: unknown) =>
      new Error(
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unexpected error"
      ),
  };
});

const okResult = (data: unknown = null): IServerResult => ({
  data,
  error: null,
  status: 200,
});

const pkeyConflict = (table: string): IServerResult => ({
  data: null,
  error: {
    code: "23505",
    message: `duplicate key value violates unique constraint "${table}_pkey"`,
  },
  status: 409,
});

const insertWrite = (values: unknown, table = "suppliers"): IQueuedWrite => ({
  id: "write-1",
  label: "Add supplier",
  owner: "user-1",
  kind: "insert",
  table,
  values,
});

const updateWrite = (match: Record<string, unknown>): IQueuedWrite => ({
  id: "write-1",
  label: "Edit supplier",
  owner: "user-1",
  kind: "update",
  table: "suppliers",
  values: { name: "Renamed" },
  match,
});

const deleteWrite = (match: Record<string, unknown>): IQueuedWrite => ({
  id: "write-1",
  label: "Delete supplier",
  owner: "user-1",
  kind: "delete",
  table: "suppliers",
  match,
});

const rpcWrite = (fn: string, args: Record<string, unknown>): IQueuedWrite => ({
  id: "write-1",
  label: "Run",
  owner: "user-1",
  kind: "rpc",
  fn,
  args,
});

const refusalOf = async (write: IQueuedWrite): Promise<unknown> =>
  executeWrite(write).then(
    () => null,
    (error: unknown) => error
  );

beforeEach(() => {
  server.writeResult = okResult();
  server.lookupResult = okResult([]);
  server.lookups = [];
});

describe("failureKindOf", () => {
  it("keeps the kind a write error carries", () => {
    expect(failureKindOf(new WriteError("session", "expired"))).toBe("session");
    expect(failureKindOf(new WriteError("network", "offline"))).toBe("network");
  });

  it("reads a TypeError as a network failure and anything else as refused", () => {
    expect(failureKindOf(new TypeError("Failed to fetch"))).toBe("network");
    expect(failureKindOf(new Error("nope"))).toBe("refused");
    expect(failureKindOf("nope")).toBe("refused");
  });
});

describe("messageOf", () => {
  it("takes the message of an error and the text of anything else", () => {
    expect(messageOf(new Error("nope"))).toBe("nope");
    expect(messageOf("plain")).toBe("plain");
    expect(messageOf(42)).toBe("42");
  });
});

describe("prepareWrite", () => {
  const supplierInsert: IQueuedWriteInput = {
    label: "Add supplier",
    kind: "insert",
    table: "suppliers",
    values: { name: "Acme" },
  };

  it("stamps a write id, the owner and the queue time", () => {
    const write = prepareWrite(supplierInsert, "user-1");

    expect(write.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(write.owner).toBe("user-1");
    expect(typeof write.queuedAt).toBe("number");
  });

  it("gives an inserted record its own id, ahead of its values", () => {
    const write = prepareWrite(supplierInsert, "user-1");
    const values = queuedInsertOf(write, "suppliers");

    expect(values?.name).toBe("Acme");
    expect(values?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(values?.id).not.toBe(write.id);
  });

  it("keeps an id the caller already set", () => {
    const write = prepareWrite(
      { ...supplierInsert, values: { id: "record-1", name: "Acme" } },
      "user-1"
    );

    expect(queuedInsertOf(write, "suppliers")).toEqual({
      id: "record-1",
      name: "Acme",
    });
  });

  it("does not stamp an id on a record keyed by slug", () => {
    const write = prepareWrite(
      {
        label: "Add category",
        kind: "insert",
        table: "expense_categories",
        values: { slug: "fuel", name: "Fuel" },
      },
      "user-1"
    );

    expect(queuedInsertOf(write, "expense_categories")).toEqual({
      slug: "fuel",
      name: "Fuel",
    });
  });

  it("leaves a list of records unstamped", () => {
    const rows = [{ name: "Acme" }, { name: "Bolt" }];
    const write = prepareWrite({ ...supplierInsert, values: rows }, "user-1");

    expect(write.kind === "insert" ? write.values : null).toEqual(rows);
  });

  it("sends the write id as the idempotency key of a replay-safe rpc", () => {
    const write = prepareWrite(
      {
        label: "Record payment",
        kind: "rpc",
        fn: "record_ledger_payment",
        args: { p_amount: 100 },
      },
      "user-1"
    );

    expect(queuedRpcArgsOf(write, "record_ledger_payment")).toEqual({
      p_idempotency_key: write.id,
      p_amount: 100,
    });
  });

  it("keeps an idempotency key the caller already set", () => {
    const write = prepareWrite(
      {
        label: "Record payment",
        kind: "rpc",
        fn: "record_ledger_payment",
        args: { p_idempotency_key: "caller-key" },
      },
      "user-1"
    );

    expect(queuedRpcArgsOf(write, "record_ledger_payment")).toEqual({
      p_idempotency_key: "caller-key",
    });
  });

  it("adds no idempotency key to an rpc outside the replay-safe list", () => {
    const write = prepareWrite(
      {
        label: "Save customer details",
        kind: "rpc",
        fn: "save_customer_details",
        args: { p_customer_id: "customer-1" },
      },
      "user-1"
    );

    expect(queuedRpcArgsOf(write, "save_customer_details")).toEqual({
      p_customer_id: "customer-1",
    });
  });

  it("stamps a transaction edit so a replay is not read as a conflict", () => {
    const write = prepareWrite(
      {
        label: "Edit transaction",
        kind: "rpc",
        fn: "update_transaction_with_voucher",
        args: { p_transaction_id: "transaction-1" },
      },
      "user-1"
    );

    expect(queuedRpcArgsOf(write, "update_transaction_with_voucher")).toEqual({
      p_idempotency_key: write.id,
      p_transaction_id: "transaction-1",
    });
  });

  it("leaves updates and deletes as given", () => {
    const write = prepareWrite(
      {
        label: "Edit supplier",
        kind: "update",
        table: "suppliers",
        values: { name: "Renamed" },
        match: { id: "record-1" },
      },
      null
    );

    expect(write).toMatchObject({
      kind: "update",
      owner: null,
      values: { name: "Renamed" },
      match: { id: "record-1" },
    });
  });
});

describe("queued write readers", () => {
  it("reads the values of an insert into the named table only", () => {
    const write = insertWrite({ id: "record-1" });

    expect(queuedInsertOf(write, "suppliers")).toEqual({ id: "record-1" });
    expect(queuedInsertOf(write, "customers")).toBeNull();
    expect(queuedInsertOf(insertWrite([{ id: "record-1" }]), "suppliers")).toBeNull();
    expect(queuedInsertOf(updateWrite({ id: "record-1" }), "suppliers")).toBeNull();
  });

  it("reads the args of the named rpc only", () => {
    const write = rpcWrite("verify_sale", { p_transaction_id: "transaction-1" });

    expect(queuedRpcArgsOf(write, "verify_sale")).toEqual({
      p_transaction_id: "transaction-1",
    });
    expect(queuedRpcArgsOf(write, "reject_sale")).toBeNull();
  });

  it("gives the queue time as an ISO timestamp", () => {
    expect(queuedAtOf({ ...insertWrite({}), queuedAt: 0 })).toBe(
      "1970-01-01T00:00:00.000Z"
    );
  });
});

describe("writeTargetsOf", () => {
  it("targets the id and slug of an inserted record", () => {
    expect(writeTargetsOf(insertWrite({ id: "record-1", name: "Acme" }))).toEqual([
      "record-1",
    ]);
    expect(writeTargetsOf(insertWrite({ slug: "fuel" }))).toEqual(["fuel"]);
    expect(writeTargetsOf(insertWrite({ name: "Acme" }))).toEqual([]);
  });

  it("targets the matched id or slug of an update and a delete", () => {
    expect(writeTargetsOf(updateWrite({ id: "record-1", version: 3 }))).toEqual([
      "record-1",
    ]);
    expect(writeTargetsOf(deleteWrite({ slug: "fuel" }))).toEqual(["fuel"]);
  });

  it("targets the write itself, the record args and the allocated ledger rows of an rpc", () => {
    expect(
      writeTargetsOf(
        rpcWrite("record_ledger_payment", {
          p_payable_id: "payable-1",
          p_amount: 100,
          p_allocations: [
            { ledger_id: "ledger-1", amount: 60 },
            { ledger_id: "ledger-2", amount: 40 },
            { amount: 5 },
          ],
        })
      )
    ).toEqual(["write-1", "payable-1", "ledger-1", "ledger-2"]);
  });
});

describe("isOwnWrite", () => {
  it("matches the owner, and treats an unowned write as anyone's", () => {
    expect(isOwnWrite(insertWrite({}), "user-1")).toBe(true);
    expect(isOwnWrite(insertWrite({}), "user-2")).toBe(false);
    expect(isOwnWrite(insertWrite({}), null)).toBe(false);
    expect(isOwnWrite({ ...insertWrite({}), owner: null }, "user-2")).toBe(true);
  });
});

describe("executeWrite", () => {
  it("resolves when the server accepts the write", async () => {
    await expect(executeWrite(insertWrite({ id: "record-1" }))).resolves.toBeUndefined();
    await expect(
      executeWrite(rpcWrite("verify_sale", { p_transaction_id: "transaction-1" }))
    ).resolves.toBeUndefined();
  });

  it("treats a primary-key conflict on a stamped insert as already saved", async () => {
    server.writeResult = pkeyConflict("suppliers");

    await expect(executeWrite(insertWrite({ id: "record-1" }))).resolves.toBeUndefined();
    expect(server.lookups).toEqual([]);
  });

  it("refuses any other unique violation on an insert", async () => {
    server.writeResult = {
      data: null,
      error: {
        code: "23505",
        message: 'duplicate key value violates unique constraint "suppliers_name_key"',
      },
      status: 409,
    };

    const error = await refusalOf(insertWrite({ id: "record-1", name: "Acme" }));

    expect(error).toBeInstanceOf(WriteError);
    expect(failureKindOf(error)).toBe("refused");
  });

  it("treats a replayed slug insert as saved when the stored row holds the same values", async () => {
    server.writeResult = pkeyConflict("expense_categories");
    server.lookupResult = okResult([
      { slug: "fuel", name: "Fuel", active: true, created_at: "2026-01-15" },
    ]);

    await expect(
      executeWrite(
        insertWrite({ slug: "fuel", name: "Fuel", active: true }, "expense_categories")
      )
    ).resolves.toBeUndefined();
    expect(server.lookups).toEqual([{ slug: "fuel" }]);
  });

  it("refuses a slug insert when the stored row holds different values", async () => {
    server.writeResult = pkeyConflict("expense_categories");
    server.lookupResult = okResult([{ slug: "fuel", name: "Diesel" }]);

    const error = await refusalOf(
      insertWrite({ slug: "fuel", name: "Fuel" }, "expense_categories")
    );

    expect(failureKindOf(error)).toBe("refused");
  });

  it("classifies a failure by its status", async () => {
    server.writeResult = {
      data: null,
      error: { message: "TypeError: Failed to fetch" },
      status: 0,
    };
    expect(failureKindOf(await refusalOf(insertWrite({ id: "record-1" })))).toBe(
      "network"
    );

    server.writeResult = {
      data: null,
      error: { message: "JWT expired" },
      status: 401,
    };
    expect(failureKindOf(await refusalOf(insertWrite({ id: "record-1" })))).toBe(
      "session"
    );

    server.writeResult = {
      data: null,
      error: { code: "P0001", message: "Voucher is already approved" },
      status: 400,
    };
    const refused = await refusalOf(insertWrite({ id: "record-1" }));
    expect(failureKindOf(refused)).toBe("refused");
    expect(messageOf(refused)).toBe("Voucher is already approved");
  });

  it("uses the copy the write supplies for an error code", async () => {
    server.writeResult = {
      data: null,
      error: { code: "23503", message: "violates foreign key constraint" },
      status: 409,
    };

    const error = await refusalOf({
      ...deleteWrite({ id: "record-1" }),
      errors: { "23503": "This supplier still has records." },
    });

    expect(messageOf(error)).toBe("This supplier still has records.");
  });

  it("refuses a versioned update that matched nothing as a conflicting edit", async () => {
    server.writeResult = okResult([]);

    const error = await refusalOf(updateWrite({ id: "record-1", version: 3 }));

    expect(failureKindOf(error)).toBe("refused");
    expect(messageOf(error)).toBe(
      "Edit supplier was refused — someone else changed this record after you opened it. Reopen it and edit again."
    );
  });

  it("refuses an unversioned update that matched nothing as gone or not permitted", async () => {
    server.writeResult = okResult([]);

    const error = await refusalOf(updateWrite({ id: "record-1" }));

    expect(messageOf(error)).toBe(
      "Edit supplier changed nothing — the record is gone or you lack permission for it."
    );
  });

  it("accepts an update that matched a row", async () => {
    server.writeResult = okResult([{ id: "record-1" }]);

    await expect(
      executeWrite(updateWrite({ id: "record-1", version: 3 }))
    ).resolves.toBeUndefined();
  });

  it("treats a delete that matched nothing as done when the row is already gone", async () => {
    server.writeResult = okResult([]);
    server.lookupResult = okResult([]);

    await expect(executeWrite(deleteWrite({ id: "record-1" }))).resolves.toBeUndefined();
    expect(server.lookups).toEqual([{ id: "record-1" }]);
  });

  it("refuses a delete that matched nothing while the row still exists", async () => {
    server.writeResult = okResult([]);
    server.lookupResult = okResult([{ id: "record-1" }]);

    const error = await refusalOf(deleteWrite({ id: "record-1" }));

    expect(messageOf(error)).toBe(
      "Delete supplier changed nothing — the record is gone or you lack permission for it."
    );
  });
});
