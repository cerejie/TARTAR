import type { LedgerStatus } from "../../enums/ledger.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type {
  IPayableInput,
  IReceivableInput,
} from "../../models/data/ledger/ledger.request";
import type {
  ICustomerLedgerKey,
  ICustomerReceivableSummary,
  ILedgerPartyKey,
  ILedgerPartySummary,
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

type IPartySummaryRow = {
  amount: number;
  paid_amount: number;
  status: LedgerStatus;
  created_at: string;
} & Record<"customer_id" | "supplier_id", string | null> &
  Record<"customer_name" | "supplier_name", string>;
const reportLimit = 5000;

const makeLedgerServices = <Row, Input extends { branch: string; amount: number; due_date: string; reference_number?: string | null }>(
  config: ILedgerConfig<Input>
) => {
  const noun = config.table.slice(0, -1);
  const columns = { ...ledgerColumns, search: config.nameColumn };

  return {
    getList: async (
      filters: ILedgerFilters = {},
      pagination: IPaginationRequest
    ): Promise<IPaginationResponse<Row>> => {
      const filtered = applyLedgerFilters(
        supabase.from(config.table).select("*", { count: "exact" }),
        filters,
        columns
      );
      const { from, to } = pageRange(pagination);

      const { data, error, count } = await applyStatusFilter(
        filtered,
        filters.status
      )
        .order("due_date", { ascending: true })
        .range(from, to);
      if (error) throw toError(error);

      return {
        data: (data ?? []) as unknown as Row[],
        currentPage: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: count ?? 0,
      };
    },

    getAll: async (filters: ILedgerFilters = {}): Promise<Row[]> => {
      const filtered = applyLedgerFilters(
        supabase.from(config.table).select("*"),
        filters,
        columns
      );

      const { data, error } = await applyStatusFilter(
        filtered,
        filters.status
      )
        .order("due_date", { ascending: true })
        .limit(reportLimit);
      if (error) throw toError(error);

      return (data ?? []) as unknown as Row[];
    },

    getPartySummaries: async (): Promise<ILedgerPartySummary[]> => {
      const { data, error } = await supabase
        .from(config.table)
        .select(
          `${config.idColumn}, ${config.nameColumn}, amount, paid_amount, status, created_at`
        );
      if (error) throw toError(error);

      const byKey = new Map<string, ILedgerPartySummary>();

      for (const row of (data ?? []) as unknown as IPartySummaryRow[]) {
        const partyId = row[config.idColumn] ?? null;
        const partyName = row[config.nameColumn];
        const key = partyId ?? `name:${partyName}`;
        const summary = byKey.get(key) ?? {
          partyId,
          partyName,
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
        a.partyName.localeCompare(b.partyName)
      );
    },

    getPartyLedger: async (
      party: ILedgerPartyKey,
      filters: ILedgerFilters = {}
    ): Promise<Row[]> => {
      const base = supabase.from(config.table).select("*");
      const scoped = party.partyId
        ? base.eq(config.idColumn, party.partyId)
        : base.is(config.idColumn, null).eq(config.nameColumn, party.partyName);

      const filtered = applyLedgerFilters(scoped, filters, columns);

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
