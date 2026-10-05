import dayjs from "dayjs";
import {
  transactionTypeLabels,
  type DisbursementKind,
} from "../../enums/transaction.enum";
import { withholdingRates, type VoucherStatus } from "../../enums/voucher.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import { bankAccountOf } from "../../models/data/bank/bank.request";
import type { IBranchSummaryData } from "../../models/data/report/report.response";
import type {
  IDisbursementInput,
  ITransactionInput,
} from "../../models/data/transaction/transaction.request";
import {
  blankTransactionFields,
  isDisbursementType,
  type IDisbursement,
  type IDisbursementPayable,
  type ITransaction,
  type ITransactionAudit,
} from "../../models/data/transaction/transaction.response";
import type { IVoucher } from "../../models/data/voucher/voucher.response";
import { runWrite } from "../../store/common/sync.store";
import {
  applyLedgerFilters,
  transactionFilterColumns,
} from "../../utils/filter.utils";
import { everyRow, everyRowIn } from "../../utils/page.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { breakdownTotalsOf } from "../../utils/voucher.utils";
import { queuedAtOf, queuedRpcArgsOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

const table = "transactions";
const auditTable = "transaction_audit";
const voucherTable = "vouchers";
const payableTable = "payables";

const defaultSort: ISortState = { column: "txn_date", direction: "descending" };

const columns = `
  id, type, branch, farm_section, txn_date, amount, reference_number, description,
  customer_id, supplier_id, cash_account, bank_account_id, income_source, expense_type, due_date,
  sale_status, created_by, created_at, version,
  customer:customers(name), supplier:suppliers(name)
`;

const dueDateColumns = {
  date: "due_date",
  amount: "amount",
};

const breakdownArgs = (values: IDisbursementInput) => {
  const totals = breakdownTotalsOf(values);

  return {
    p_ewt_rate: withholdingRates[values.withholding],
    p_ewt_amount: totals.ewt,
    p_less_return: totals.lessReturn,
    p_particulars: values.particulars || null,
    p_vatable: values.vatable,
  };
};

const checkNumberArgs = (checkNumber: string | null | undefined) =>
  checkNumber === undefined || checkNumber === null
    ? {}
    : { p_check_number: checkNumber };

const payablesOf = async (
  vouchers: readonly IVoucher[]
): Promise<Map<string, IDisbursementPayable>> => {
  const payableIds = vouchers.flatMap((voucher) =>
    voucher.payable_id ? [voucher.payable_id] : []
  );
  if (payableIds.length === 0) return new Map();

  const payables = await everyRowIn<IDisbursementPayable & { id: string }>(
    payableIds,
    (ids) =>
      supabase
        .from(payableTable)
        .select("id, status, amount, paid_amount")
        .in("id", ids)
  );

  return new Map(payables.map(({ id, ...payable }) => [id, payable]));
};

const withVouchers = async (
  rows: readonly ITransaction[]
): Promise<IDisbursement[]> => {
  if (rows.length === 0) return [];

  const vouchers = await everyRowIn<IVoucher>(
    rows.map((row) => row.id),
    (ids) => supabase.from(voucherTable).select("*").in("transaction_id", ids)
  );
  const voucherByTransaction = new Map(
    vouchers.map((voucher) => [voucher.transaction_id, voucher])
  );
  const payableById = await payablesOf(vouchers);

  return rows.map((row) => {
    const voucher = voucherByTransaction.get(row.id) ?? null;

    return {
      ...row,
      voucher,
      payable: voucher?.payable_id
        ? payableById.get(voucher.payable_id) ?? null
        : null,
    };
  });
};

const voucherJoinColumns = `${columns}, vouchers!inner(status, created_at)`;

const dateBasisOf = (kind: DisbursementKind, filters: ILedgerFilters) =>
  kind === "purchase" ? filters.dateBasis : undefined;

const paidPurchaseIdsOf = async (
  kind: DisbursementKind,
  filters: ILedgerFilters
): Promise<string[] | null> => {
  if (dateBasisOf(kind, filters) !== "paid") return null;

  const { data, error } = await supabase.rpc("purchase_ids_paid_between", {
    p_from: filters.dateFrom ?? null,
    p_to: filters.dateTo ?? null,
  });
  if (error) throw toError(error);

  return (data ?? []) as string[];
};

const disbursementQuery = (
  kind: DisbursementKind,
  filters: ILedgerFilters,
  paidIds: readonly string[] | null
) => {
  const basis = dateBasisOf(kind, filters);
  const joinsVoucher = !!filters.voucherStatus || basis === "voucher";
  const base = supabase
    .from(table)
    .select(joinsVoucher ? voucherJoinColumns : columns, {
      count: "exact",
    })
    .eq("type", kind);
  const byVoucher = filters.voucherStatus
    ? base.eq("vouchers.status", filters.voucherStatus)
    : base;
  const txnDateFilters = basis
    ? { ...filters, dateFrom: undefined, dateTo: undefined }
    : filters;
  const filtered = applyLedgerFilters(byVoucher, txnDateFilters);

  if (basis === "paid") return filtered.in("id", paidIds ?? []);
  if (basis !== "voucher") return filtered;

  const fromVoucherDate = filters.dateFrom
    ? filtered.gte(
        "vouchers.created_at",
        dayjs(filters.dateFrom).startOf("day").toISOString()
      )
    : filtered;

  return filters.dateTo
    ? fromVoucherDate.lte(
        "vouchers.created_at",
        dayjs(filters.dateTo).endOf("day").toISOString()
      )
    : fromVoucherDate;
};

const transactionServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<ITransaction>> => {
    const base = supabase.from(table).select(columns, { count: "exact" });
    const query = applyLedgerFilters(base, filters, transactionFilterColumns);
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

  getAll: (filters: ILedgerFilters = {}): Promise<ITransaction[]> =>
    everyRow<ITransaction>(() =>
      applyLedgerFilters(
        supabase.from(table).select(columns),
        filters,
        transactionFilterColumns
      ).order("txn_date", { ascending: false })
    ),

  getAllWithVouchers: async (
    filters: ILedgerFilters = {}
  ): Promise<IDisbursement[]> => {
    const rows = await transactionServices.getAll(filters);
    const disbursements = await withVouchers(
      rows.filter((row) => isDisbursementType(row.type))
    );
    const disbursementById = new Map(
      disbursements.map((row) => [row.id, row])
    );

    return rows.map(
      (row) => disbursementById.get(row.id) ?? { ...row, voucher: null }
    );
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
        bank_account_id: bankAccountOf(values),
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

    const paidIds = await paidPurchaseIdsOf(kind, filters);
    const { data, error, count } = await disbursementQuery(
      kind,
      filters,
      paidIds
    )
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
    const paidIds = await paidPurchaseIdsOf(kind, filters);
    const rows = await everyRow<ITransaction>(() =>
      disbursementQuery(kind, filters, paidIds).order("txn_date", {
        ascending: false,
      })
    );

    return withVouchers(rows);
  },

  getPurchasesDueAll: async (
    filters: ILedgerFilters = {}
  ): Promise<IDisbursement[]> => {
    const rows = await everyRow<ITransaction>(() =>
      applyLedgerFilters(
        supabase.from(table).select(columns).eq("type", "purchase"),
        filters,
        dueDateColumns
      )
        .not("due_date", "is", null)
        .order("due_date", { ascending: true })
    );

    return withVouchers(rows);
  },

  getDisbursement: async (id: string): Promise<IDisbursement | null> => {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq("id", id)
      .maybeSingle();
    if (error) throw toError(error);
    if (!data) return null;

    const [row] = await withVouchers([data as unknown as ITransaction]);
    return row ?? null;
  },

  getBranchSummary: async (
    filters: ILedgerFilters
  ): Promise<IBranchSummaryData> => {
    const [sales, purchases, expenses] = await Promise.all([
      transactionServices.getAll({ ...filters, type: "sale" }),
      transactionServices.getDisbursementAll("purchase", filters),
      transactionServices.getDisbursementAll("expense", filters),
    ]);
    return { sales, purchases, expenses };
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
        p_description: values.description ?? null,
        p_supplier_id: values.supplier_id ?? null,
        p_cash_account: values.cash_account ?? null,
        p_bank_account_id: bankAccountOf(values),
        p_expense_type: kind === "expense" ? values.expense_type ?? null : null,
        p_payee: values.payee ?? null,
        p_voucher_type: values.cash_account
          ? null
          : values.voucher_type ?? null,
        p_created_by: createdBy,
        p_due_date: values.due_date ?? null,
        ...breakdownArgs(values),
        ...checkNumberArgs(values.check_number || null),
      },
    }),

  updateDisbursement: (
    id: string,
    kind: DisbursementKind,
    values: IDisbursementInput,
    version: number,
    voucherStatus: VoucherStatus | null
  ) =>
    runWrite({
      label: `Edit ${transactionTypeLabels[kind].toLowerCase()}`,
      kind: "rpc",
      fn: "update_transaction_with_voucher",
      args: {
        p_expected_version: version,
        p_expected_voucher_status: voucherStatus,
        p_transaction_id: id,
        p_branch: values.branch,
        p_txn_date: values.txn_date,
        p_amount: values.amount,
        p_farm_section: values.farm_section ?? null,
        p_description: values.description ?? null,
        p_supplier_id: values.supplier_id ?? null,
        p_cash_account: values.cash_account ?? null,
        p_bank_account_id: bankAccountOf(values),
        p_expense_type: kind === "expense" ? values.expense_type ?? null : null,
        p_due_date: values.due_date ?? null,
        ...breakdownArgs(values),
        ...checkNumberArgs(values.check_number),
      },
    }),

  getAllAudits: (): Promise<ITransactionAudit[]> =>
    everyRow<ITransactionAudit>(() =>
      supabase
        .from(auditTable)
        .select("*")
        .order("edited_at", { ascending: false })
    ),

  getAudit: async (transactionId: string): Promise<ITransactionAudit[]> => {
    const { data, error } = await supabase
      .from(auditTable)
      .select("*")
      .eq("transaction_id", transactionId)
      .order("edited_at", { ascending: false });

    if (error) throw toError(error);

    return (data ?? []) as ITransactionAudit[];
  },

  pendingDisbursementOf: (
    kind: DisbursementKind,
    write: IQueuedWrite
  ): IDisbursement | null => {
    const args = queuedRpcArgsOf(write, "create_transaction_with_voucher");
    if (args?.p_type !== kind) return null;

    return {
      ...blankTransactionFields,
      id: write.id,
      type: kind,
      branch: args.p_branch,
      txn_date: args.p_txn_date,
      amount: args.p_amount,
      farm_section: args.p_farm_section,
      description: args.p_description,
      supplier_id: args.p_supplier_id,
      cash_account: args.p_cash_account,
      bank_account_id: args.p_bank_account_id,
      expense_type: args.p_expense_type,
      due_date: args.p_due_date,
      created_by: args.p_created_by,
      created_at: queuedAtOf(write),
      supplier: args.p_payee ? { name: args.p_payee } : null,
      voucher: null,
      payable: null,
    } as unknown as IDisbursement;
  },
};

export default transactionServices;
