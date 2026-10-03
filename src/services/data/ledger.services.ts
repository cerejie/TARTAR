import type { LedgerStatus } from "../../enums/ledger.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import { bankAccountOf } from "../../models/data/bank/bank.request";
import type {
  IMarkPaidInput,
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
import {
  applyLedgerFilters,
  applyStatusFilter,
  ledgerFilterColumns,
  ledgerSearchColumnsOf,
  scopeToBranch,
} from "../../utils/filter.utils";
import { everyRow } from "../../utils/page.utils";
import { supabase, toError } from "../../utils/supabase.utils";

type LedgerTable = "receivables" | "payables";

interface ILedgerConfig<Input> {
  table: LedgerTable;
  nameColumn: "customer_name" | "supplier_name";
  idColumn: "customer_id" | "supplier_id";
  getName: (values: Input) => string;
  getPartyId: (values: Input) => string | null | undefined;
}

const defaultSort: ISortState = { column: "due_date", direction: "ascending" };

type IPartySummaryRow = {
  amount: number;
  paid_amount: number;
  status: LedgerStatus;
  created_at: string;
} & Record<"customer_id" | "supplier_id", string | null> &
  Record<"customer_name" | "supplier_name", string>;

type ICustomerSummaryRow = Pick<
  IReceivable,
  | "customer_id"
  | "customer_name"
  | "amount"
  | "paid_amount"
  | "status"
  | "created_at"
>;

const makeLedgerServices = <Row, Input extends { branch: string; amount: number; due_date: string }>(
  config: ILedgerConfig<Input>
) => {
  const noun = config.table.slice(0, -1);
  const columns = ledgerSearchColumnsOf(config.nameColumn);

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
      const sort = pagination.sort ?? defaultSort;

      const { data, error, count } = await applyStatusFilter(
        filtered,
        filters.status
      )
        .order(sort.column, { ascending: sort.direction === "ascending" })
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw toError(error);

      return {
        data: (data ?? []) as unknown as Row[],
        currentPage: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: count ?? 0,
      };
    },

    getAll: (filters: ILedgerFilters = {}): Promise<Row[]> =>
      everyRow<Row>(() =>
        applyStatusFilter(
          applyLedgerFilters(
            supabase.from(config.table).select("*"),
            filters,
            columns
          ),
          filters.status
        ).order("due_date", { ascending: true })
      ),

    getPartySummaries: async (
      branch?: string | null
    ): Promise<ILedgerPartySummary[]> => {
      const rows = await everyRow<IPartySummaryRow>(() =>
        scopeToBranch(
          supabase
            .from(config.table)
            .select(
              `${config.idColumn}, ${config.nameColumn}, amount, paid_amount, status, created_at`
            ),
          branch
        )
      );

      const byKey = new Map<string, ILedgerPartySummary>();

      for (const row of rows) {
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
      const partyQuery = () => {
        const base = supabase.from(config.table).select("*");
        const scoped = party.partyId
          ? base.eq(config.idColumn, party.partyId)
          : base
              .is(config.idColumn, null)
              .eq(config.nameColumn, party.partyName);

        return applyStatusFilter(
          applyLedgerFilters(scoped, filters, columns),
          filters.status
        ).order("due_date", { ascending: true });
      };

      return everyRow<Row>(partyQuery);
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
    const rows = await everyRow<ICustomerSummaryRow>(() =>
      supabase
        .from("receivables")
        .select(
          "customer_id, customer_name, amount, paid_amount, status, created_at"
        )
    );

    const byKey = new Map<string, ICustomerReceivableSummary>();

    for (const row of rows) {
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
    const customerQuery = () => {
      const base = supabase.from("receivables").select("*");
      const scoped = customer.customerId
        ? base.eq("customer_id", customer.customerId)
        : base
            .is("customer_id", null)
            .eq("customer_name", customer.customerName);

      return applyStatusFilter(
        applyLedgerFilters(scoped, filters, ledgerFilterColumns),
        filters.status
      ).order("due_date", { ascending: true });
    };

    return everyRow<IReceivable>(customerQuery);
  },

  getCustomerLastPayment: async (
    customerId: string | null
  ): Promise<string | null> => {
    if (!customerId) return null;

    const [transactionResult, paymentResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("txn_date")
        .eq("customer_id", customerId)
        .neq("type", "sale")
        .order("txn_date", { ascending: false })
        .limit(1),
      supabase
        .from("payments")
        .select("paid_at")
        .eq("kind", "receivable")
        .eq("customer_id", customerId)
        .eq("status", "verified")
        .order("paid_at", { ascending: false })
        .limit(1),
    ]);
    if (transactionResult.error) throw toError(transactionResult.error);
    if (paymentResult.error) throw toError(paymentResult.error);

    const paymentDates = [
      transactionResult.data?.[0]?.txn_date,
      paymentResult.data?.[0]?.paid_at,
    ].filter((date): date is string => Boolean(date));

    return paymentDates.sort().at(-1) ?? null;
  },
};

export const payableServices = {
  ...makeLedgerServices<IPayable, IPayableInput>({
    table: "payables",
    nameColumn: "supplier_name",
    idColumn: "supplier_id",
    getName: (values) => values.supplier_name ?? "",
    getPartyId: (values) => values.supplier_id,
  }),

  markPaid: (
    payable: IPayable,
    values: IMarkPaidInput,
    createdBy: string | null
  ) =>
    runWrite({
      label: `Mark paid · ${payable.supplier_name}`,
      kind: "rpc",
      fn: "mark_payable_paid",
      args: {
        p_payable_id: payable.id,
        p_paid_at: values.paid_at,
        p_cash_account: values.cash_account ?? null,
        p_bank_account_id: bankAccountOf(values),
        p_created_by: createdBy,
      },
    }),
};
