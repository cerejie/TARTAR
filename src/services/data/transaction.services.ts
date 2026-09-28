import {
  transactionTypeLabels,
  type DisbursementKind,
} from "../../enums/transaction.enum";
import { withholdingRates } from "../../enums/voucher.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import type {
  IDisbursementInput,
  ITransactionInput,
} from "../../models/data/transaction/transaction.request";
import type {
  IDisbursement,
  ITransaction,
  ITransactionAudit,
} from "../../models/data/transaction/transaction.response";
import type { IVoucher } from "../../models/data/voucher/voucher.response";
import { runWrite } from "../../store/common/sync.store";
import { applyLedgerFilters } from "../../utils/filter.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { breakdownTotalsOf } from "../../utils/voucher.utils";

const table = "transactions";
const auditTable = "transaction_audit";
const voucherTable = "vouchers";

const defaultSort: ISortState = { column: "txn_date", direction: "descending" };

const columns = `
  id, type, branch, farm_section, txn_date, amount, reference_number, description,
  customer_id, supplier_id, cash_account, income_source, expense_type, due_date,
  sale_status, created_by, created_at,
  customer:customers(name), supplier:suppliers(name)
`;

const transactionColumns = {
  date: "txn_date",
  amount: "amount",
  type: "type",
};

const reportLimit = 5000;

const referenceOf = (
  kind: DisbursementKind,
  values: IDisbursementInput
): string | null =>
  kind === "purchase" ? values.reference_number?.trim() || null : null;

const breakdownArgs = (values: IDisbursementInput) => {
  const totals = breakdownTotalsOf(values);

  return {
    p_ewt_rate: withholdingRates[values.withholding],
    p_ewt_amount: totals.ewt,
    p_less_return: totals.lessReturn,
    p_particulars: values.particulars || null,
  };
};

const withVouchers = async (
  rows: readonly ITransaction[]
): Promise<IDisbursement[]> => {
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from(voucherTable)
    .select("*")
    .in(
      "transaction_id",
      rows.map((row) => row.id)
    );
  if (error) throw toError(error);

  const voucherByTransaction = new Map(
    ((data ?? []) as IVoucher[]).map((voucher) => [
      voucher.transaction_id,
      voucher,
    ])
  );

  return rows.map((row) => ({
    ...row,
    voucher: voucherByTransaction.get(row.id) ?? null,
  }));
};

const voucherStatusColumns = `${columns}, vouchers!inner(status)`;

const disbursementQuery = (kind: DisbursementKind, filters: ILedgerFilters) => {
  const base = supabase
    .from(table)
    .select(filters.voucherStatus ? voucherStatusColumns : columns, {
      count: "exact",
    })
    .eq("type", kind);
  const byVoucher = filters.voucherStatus
    ? base.eq("vouchers.status", filters.voucherStatus)
    : base;

  return applyLedgerFilters(byVoucher, filters);
};

const transactionServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<ITransaction>> => {
    const base = supabase.from(table).select(columns, { count: "exact" });
    const query = applyLedgerFilters(base, filters, transactionColumns);
    const { from, to } = pageRange(pagination);
    const sort = pagination.sort ?? defaultSort;

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.direction === "ascending" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return {
      data: (data ?? []) as unknown as ITransaction[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  getAll: async (filters: ILedgerFilters = {}): Promise<ITransaction[]> => {
    const base = supabase.from(table).select(columns);
    const query = applyLedgerFilters(base, filters, transactionColumns);

    const { data, error } = await query
      .order("txn_date", { ascending: false })
      .limit(reportLimit);
    if (error) throw toError(error);

    return (data ?? []) as unknown as ITransaction[];
  },

  create: (values: ITransactionInput, createdBy: string | null) =>
    runWrite({
      label: `${transactionTypeLabels[values.type]} · ${values.amount}`,
      kind: "insert",
      table,
      values: {
        type: values.type,
        branch: values.branch,
        farm_section: values.farm_section ?? null,
        txn_date: values.txn_date,
        amount: values.amount,
        reference_number: values.reference_number ?? null,
        description: values.description ?? null,
        customer_id: values.customer_id ?? null,
        supplier_id: values.supplier_id ?? null,
        cash_account: values.cash_account ?? null,
        income_source: values.income_source ?? null,
        expense_type: values.expense_type ?? null,
        created_by: createdBy,
      },
    }),

  remove: (id: string) =>
    runWrite({
      label: "Delete transaction",
      kind: "delete",
      table,
      match: { id },
    }),

  getDisbursementList: async (
    kind: DisbursementKind,
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<IDisbursement>> => {
    const { from, to } = pageRange(pagination);
    const sort = pagination.sort ?? defaultSort;

    const { data, error, count } = await disbursementQuery(kind, filters)
      .order(sort.column, { ascending: sort.direction === "ascending" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return {
      data: await withVouchers((data ?? []) as unknown as ITransaction[]),
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  getDisbursementAll: async (
    kind: DisbursementKind,
    filters: ILedgerFilters = {}
  ): Promise<IDisbursement[]> => {
    const { data, error } = await disbursementQuery(kind, filters)
      .order("txn_date", { ascending: false })
      .limit(reportLimit);
    if (error) throw toError(error);

    return withVouchers((data ?? []) as unknown as ITransaction[]);
  },

  createDisbursement: (
    kind: DisbursementKind,
    values: IDisbursementInput,
    createdBy: string | null
  ) =>
    runWrite({
      label: `${transactionTypeLabels[kind]} · ${values.amount}`,
      kind: "rpc",
      fn: "create_transaction_with_voucher",
      args: {
        p_type: kind,
        p_branch: values.branch,
        p_txn_date: values.txn_date,
        p_amount: values.amount,
        p_farm_section: values.farm_section ?? null,
        p_reference_number: referenceOf(kind, values),
        p_description: values.description ?? null,
        p_supplier_id: values.supplier_id ?? null,
        p_cash_account: values.cash_account ?? null,
        p_expense_type: kind === "expense" ? values.expense_type ?? null : null,
        p_payee: values.payee ?? null,
        p_voucher_type: values.cash_account
          ? null
          : values.voucher_type ?? null,
        p_created_by: createdBy,
        p_due_date: kind === "purchase" ? values.due_date ?? null : null,
        ...breakdownArgs(values),
      },
    }),

  updateDisbursement: (
    id: string,
    kind: DisbursementKind,
    values: IDisbursementInput
  ) =>
    runWrite({
      label: `Edit ${transactionTypeLabels[kind].toLowerCase()}`,
      kind: "rpc",
      fn: "update_transaction_with_voucher",
      args: {
        p_transaction_id: id,
        p_branch: values.branch,
        p_txn_date: values.txn_date,
        p_amount: values.amount,
        p_farm_section: values.farm_section ?? null,
        p_reference_number: referenceOf(kind, values),
        p_description: values.description ?? null,
        p_supplier_id: values.supplier_id ?? null,
        p_cash_account: values.cash_account ?? null,
        p_expense_type: kind === "expense" ? values.expense_type ?? null : null,
        p_due_date: kind === "purchase" ? values.due_date ?? null : null,
        ...breakdownArgs(values),
      },
    }),

  getAudit: async (transactionId: string): Promise<ITransactionAudit[]> => {
    const { data, error } = await supabase
      .from(auditTable)
      .select("*")
      .eq("transaction_id", transactionId)
      .order("edited_at", { ascending: false });

    if (error) throw toError(error);

    return (data ?? []) as ITransactionAudit[];
  },
};

export default transactionServices;
