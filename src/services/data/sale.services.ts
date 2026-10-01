import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import { bankAccountOf } from "../../models/data/bank/bank.request";
import type {
  ISaleInput,
  ISaleResubmitInput,
} from "../../models/data/sale/sale.request";
import type { ISale } from "../../models/data/sale/sale.response";
import { blankTransactionFields } from "../../models/data/transaction/transaction.response";
import { runWrite } from "../../store/common/sync.store";
import { applyLedgerFilters } from "../../utils/filter.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { queuedAtOf, queuedInsertOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

const table = "transactions";

const defaultSort: ISortState = { column: "txn_date", direction: "descending" };

const columns = `
  id, type, branch, farm_section, txn_date, amount, reference_number, description,
  customer_id, supplier_id, cash_account, bank_account_id, income_source, expense_type, due_date,
  created_by, created_at, version,
  sale_status, deposit_date, deposited_by, deposited_at, verified_by, verified_at,
  rejection_reason,
  customer:customers(name)
`;

const reportLimit = 5000;

const saleQuery = (filters: ILedgerFilters, count?: "exact") => {
  const base = supabase
    .from(table)
    .select(columns, count ? { count } : undefined)
    .eq("type", "sale");
  const byStatus = filters.saleStatus
    ? base.eq("sale_status", filters.saleStatus)
    : base;

  return applyLedgerFilters(byStatus, filters);
};

const saleValues = (values: ISaleInput) => ({
  branch: values.branch,
  farm_section: values.branch === "farm" ? values.farm_section ?? null : null,
  txn_date: values.txn_date,
  amount: values.amount,
  income_source: values.income_source,
  cash_account: values.cash_account ?? null,
  bank_account_id: bankAccountOf(values),
  customer_id: values.customer_id ?? null,
  reference_number: values.reference_number || null,
  description: values.description || null,
});

const saleServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<ISale>> => {
    const { from, to } = pageRange(pagination);
    const sort = pagination.sort ?? defaultSort;

    const { data, error, count } = await saleQuery(filters, "exact")
      .order(sort.column, { ascending: sort.direction === "ascending" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return {
      data: (data ?? []) as unknown as ISale[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  getAll: async (filters: ILedgerFilters = {}): Promise<ISale[]> => {
    const { data, error } = await saleQuery(filters)
      .order("txn_date", { ascending: false })
      .limit(reportLimit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as ISale[];
  },

  create: (values: ISaleInput, createdBy: string | null) =>
    runWrite({
      label: `Sale · ${values.amount}`,
      kind: "insert",
      table,
      values: { ...saleValues(values), type: "sale", created_by: createdBy },
    }),

  update: (id: string, version: number, values: ISaleInput) =>
    runWrite({
      label: "Edit sale",
      kind: "update",
      table,
      values: saleValues(values),
      match: { id, version },
    }),

  markDeposited: (id: string, depositDate: string) =>
    runWrite({
      label: "Mark sale deposited",
      kind: "rpc",
      fn: "mark_sale_deposited",
      args: { p_transaction_id: id, p_deposit_date: depositDate },
    }),

  verify: (id: string) =>
    runWrite({
      label: "Verify sale",
      kind: "rpc",
      fn: "verify_sale",
      args: { p_transaction_id: id },
    }),

  reject: (id: string, reason: string) =>
    runWrite({
      label: "Reject sale",
      kind: "rpc",
      fn: "reject_sale",
      args: { p_transaction_id: id, p_reason: reason },
    }),

  resubmit: async (
    id: string,
    version: number,
    values: ISaleResubmitInput
  ) => {
    await saleServices.update(id, version, values);
    return saleServices.markDeposited(id, values.deposit_date);
  },

  pendingOf: (write: IQueuedWrite): ISale | null => {
    const values = queuedInsertOf(write, table);
    if (values?.type !== "sale") return null;

    return {
      ...blankTransactionFields,
      sale_status: "undeposited",
      deposit_date: null,
      deposited_by: null,
      deposited_at: null,
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
      created_at: queuedAtOf(write),
      ...values,
    } as unknown as ISale;
  },
};

export default saleServices;
