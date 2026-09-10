import {
  transactionTypeLabels,
  type DisbursementKind,
} from "../../enums/transaction.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
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

const table = "transactions";
const auditTable = "transaction_audit";
const voucherTable = "vouchers";

const columns = `
  id, type, branch, farm_section, txn_date, amount, reference_number, description,
  customer_id, supplier_id, cash_account, income_source, expense_type, due_date,
  created_by, created_at,
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

const transactionServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<ITransaction>> => {
    const base = supabase.from(table).select(columns, { count: "exact" });
    const query = applyLedgerFilters(base, filters, transactionColumns);
    const { from, to } = pageRange(pagination);

    const { data, error, count } = await query
      .order("txn_date", { ascending: false })
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
    filters: ILedgerFilters = {}
  ): Promise<IDisbursement[]> => {
    const query = applyLedgerFilters(
      supabase.from(table).select(columns).eq("type", kind),
      filters
    );

    const { data, error } = await query
      .order("txn_date", { ascending: false })
      .limit(500);
    if (error) throw toError(error);

    const rows = (data ?? []) as unknown as ITransaction[];
    if (rows.length === 0) return [];

    const { data: vouchers, error: voucherError } = await supabase
      .from(voucherTable)
      .select("*")
      .in(
        "transaction_id",
        rows.map((row) => row.id)
      );
    if (voucherError) throw toError(voucherError);

    const voucherByTransaction = new Map(
      ((vouchers ?? []) as IVoucher[]).map((voucher) => [
        voucher.transaction_id,
        voucher,
      ])
    );

    return rows.map((row) => ({
      ...row,
      voucher: voucherByTransaction.get(row.id) ?? null,
    }));
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
      },
    }),

  updateDisbursement: (
    id: string,
    kind: DisbursementKind,
    values: IDisbursementInput
  ) =>
    runWrite({
      label: `Edit ${transactionTypeLabels[kind].toLowerCase()}`,
      kind: "update",
      table,
      values: {
        branch: values.branch,
        farm_section: values.farm_section ?? null,
        txn_date: values.txn_date,
        amount: values.amount,
        reference_number: referenceOf(kind, values),
        description: values.description ?? null,
        supplier_id: values.supplier_id ?? null,
        cash_account: values.cash_account ?? null,
        expense_type: kind === "expense" ? values.expense_type ?? null : null,
        due_date: kind === "purchase" ? values.due_date ?? null : null,
      },
      match: { id },
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
