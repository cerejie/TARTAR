import type { LedgerStatus } from "../../enums/ledger.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import type {
  IPayableInput,
  IReceivableInput,
} from "../../models/data/ledger/ledger.request";
import type {
  ICustomerLedgerKey,
  ICustomerReceivableSummary,
  IPayable,
  IReceivable,
} from "../../models/data/ledger/ledger.response";
import { runWrite } from "../../store/common/sync.store";
import { applyLedgerFilters, applyStatusFilter } from "../../utils/filter.utils";
import { supabase, toError } from "../../utils/supabase.utils";

type LedgerTable = "receivables" | "payables";

interface ILedgerConfig<Input> {
  table: LedgerTable;
  nameColumn: "customer_name" | "supplier_name";
  idColumn: "customer_id" | "supplier_id";
  getName: (values: Input) => string;
  getPartyId: (values: Input) => string | null | undefined;
}

const ledgerColumns = { date: "due_date", amount: "amount" };

const makeLedgerServices = <Row, Input extends { branch: string; amount: number; due_date: string; reference_number?: string | null }>(
  config: ILedgerConfig<Input>
) => {
  const noun = config.table.slice(0, -1);

  return {
    getList: async (filters: ILedgerFilters = {}): Promise<Row[]> => {
      const filtered = applyLedgerFilters(
        supabase.from(config.table).select("*"),
        filters,
        ledgerColumns
      );

      const { data, error } = await applyStatusFilter(
        filtered,
        filters.status
      ).order("due_date", { ascending: true });
      if (error) throw toError(error);

      return (data ?? []) as unknown as Row[];
    },

    create: (values: Input, createdBy: string | null) =>
      runWrite({
        label: `New ${noun} · ${values.amount}`,
        kind: "insert",
        table: config.table,
        values: {
          branch: values.branch,
          [config.idColumn]: config.getPartyId(values) ?? null,
          [config.nameColumn]: config.getName(values),
          amount: values.amount,
          due_date: values.due_date,
          reference_number: values.reference_number ?? null,
          status: "open" as LedgerStatus,
          created_by: createdBy,
        },
      }),

    remove: (id: string) =>
      runWrite({
        label: `Delete ${noun}`,
        kind: "delete",
        table: config.table,
        match: { id },
      }),
  };
};

export const receivableServices = {
  ...makeLedgerServices<IReceivable, IReceivableInput>({
    table: "receivables",
    nameColumn: "customer_name",
    idColumn: "customer_id",
    getName: (values) => values.customer_name ?? "",
    getPartyId: (values) => values.customer_id,
  }),

  getCustomerSummaries: async (): Promise<ICustomerReceivableSummary[]> => {
    const { data, error } = await supabase
      .from("receivables")
      .select(
        "customer_id, customer_name, amount, paid_amount, status, created_at"
      );
    if (error) throw toError(error);

    const byKey = new Map<string, ICustomerReceivableSummary>();

    for (const row of data ?? []) {
      const key = row.customer_id ?? `name:${row.customer_name}`;
      const summary = byKey.get(key) ?? {
        customerId: row.customer_id,
        customerName: row.customer_name,
        outstanding: 0,
        unpaidCount: 0,
        lastTransactionAt: null,
      };

      summary.outstanding += Number(row.amount) - Number(row.paid_amount);
      if (row.status !== "paid") summary.unpaidCount += 1;
      if (
        !summary.lastTransactionAt ||
        row.created_at > summary.lastTransactionAt
      ) {
        summary.lastTransactionAt = row.created_at;
      }

      byKey.set(key, summary);
    }

    return [...byKey.values()].sort((a, b) =>
      a.customerName.localeCompare(b.customerName)
    );
  },

  getCustomerLedger: async (
    customer: ICustomerLedgerKey,
    filters: ILedgerFilters = {}
  ): Promise<IReceivable[]> => {
    const base = supabase.from("receivables").select("*");
    const scoped = customer.customerId
      ? base.eq("customer_id", customer.customerId)
      : base
          .is("customer_id", null)
          .eq("customer_name", customer.customerName);

    const filtered = applyLedgerFilters(scoped, filters, ledgerColumns);

    const { data, error } = await applyStatusFilter(
      filtered,
      filters.status
    ).order("due_date", { ascending: true });
    if (error) throw toError(error);

    return (data ?? []) as IReceivable[];
  },

  getCustomerLastPayment: async (
    customerId: string | null
  ): Promise<string | null> => {
    if (!customerId) return null;

    const { data, error } = await supabase
      .from("transactions")
      .select("txn_date")
      .eq("customer_id", customerId)
      .in("type", ["customer_payment", "collection"])
      .order("txn_date", { ascending: false })
      .limit(1);
    if (error) throw toError(error);

    return data?.[0]?.txn_date ?? null;
  },
};

export const payableServices = makeLedgerServices<IPayable, IPayableInput>({
  table: "payables",
  nameColumn: "supplier_name",
  idColumn: "supplier_id",
  getName: (values) => values.supplier_name ?? "",
  getPartyId: (values) => values.supplier_id,
});
