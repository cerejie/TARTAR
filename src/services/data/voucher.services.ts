import { voucherKindCategory, withholdingRates } from "../../enums/voucher.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import type { IVoucherInput } from "../../models/data/voucher/voucher.request";
import type {
  IVoucher,
  IVoucherSignatories,
} from "../../models/data/voucher/voucher.response";
import { runWrite } from "../../store/common/sync.store";
import {
  applyLedgerFilters,
  voucherFilterColumns,
} from "../../utils/filter.utils";
import { everyRow } from "../../utils/page.utils";
import { supabase, toError } from "../../utils/supabase.utils";
import { breakdownTotalsOf } from "../../utils/voucher.utils";
import { queuedAtOf, queuedInsertOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

const table = "vouchers";

const defaultSort: ISortState = { column: "created_at", direction: "descending" };

const voucherRowOf = (values: IVoucherInput) => {
  const isPurchase = values.kind === "purchase";
  const isCheck = values.type === "check";
  const totals = breakdownTotalsOf(values);

  return {
    type: values.type,
    branch: values.branch,
    payee: values.payee,
    amount: totals.amountToPay,
    gross_amount: totals.invoice,
    ewt_rate: withholdingRates[values.withholding],
    ewt_amount: totals.ewt,
    less_return: totals.lessReturn,
    vatable: values.vatable,
    particulars: values.particulars || null,
    category: voucherKindCategory[values.kind],
    supplier_id: isPurchase ? values.supplier_id ?? null : null,
    due_date: isPurchase ? values.due_date ?? null : null,
    check_bank: isCheck ? values.check_bank ?? null : null,
    check_number: isCheck ? values.check_number ?? null : null,
    check_due_date: isCheck ? values.check_due_date ?? null : null,
  };
};

const withSignatories = async (
  vouchers: readonly IVoucher[]
): Promise<IVoucher[]> => {
  if (vouchers.length === 0) return [];

  const { data, error } = await supabase.rpc("voucher_signatories", {
    p_voucher_ids: vouchers.map((voucher) => voucher.id),
  });
  if (error) throw toError(error);

  const signatoriesById = new Map(
    ((data ?? []) as IVoucherSignatories[]).map((row) => [row.voucher_id, row])
  );

  return vouchers.map((voucher) => {
    const signatories = signatoriesById.get(voucher.id);
    return {
      ...voucher,
      prepared_by_name: signatories?.prepared_by ?? null,
      approved_by_name: signatories?.approved_by ?? null,
    };
  });
};

const voucherServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<IVoucher>> => {
    const base = supabase.from(table).select("*", { count: "exact" });
    const filtered = applyLedgerFilters(base, filters, voucherFilterColumns);
    const query = filters.voucherStatus
      ? filtered.eq("status", filters.voucherStatus)
      : filtered;
    const { from, to } = pageRange(pagination);
    const sort = pagination.sort ?? defaultSort;

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.direction === "ascending" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return {
      data: await withSignatories((data ?? []) as IVoucher[]),
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  getAll: async (filters: ILedgerFilters = {}): Promise<IVoucher[]> => {
    const rows = await everyRow<IVoucher>(() => {
      const filtered = applyLedgerFilters(
        supabase.from(table).select("*"),
        filters,
        voucherFilterColumns
      );
      const query = filters.voucherStatus
        ? filtered.eq("status", filters.voucherStatus)
        : filtered;

      return query.order("created_at", { ascending: false });
    });

    return withSignatories(rows);
  },

  create: (values: IVoucherInput, createdBy: string | null) =>
    runWrite({
      label: `Voucher for ${values.payee} · ${values.amount}`,
      kind: "insert",
      table,
      values: {
        ...voucherRowOf(values),
        purpose: null,
        status: "pending",
        printed: false,
        created_by: createdBy,
      },
    }),

  update: (id: string, values: IVoucherInput) =>
    runWrite({
      label: `Edit voucher for ${values.payee} · ${values.amount}`,
      kind: "update",
      table,
      values: voucherRowOf(values),
      match: { id },
    }),

  decide: (
    id: string,
    approve: boolean,
    approverId: string | null,
    reason: string | null = null
  ) =>
    runWrite({
      label: `${approve ? "Approve" : "Reject"} voucher`,
      kind: "update",
      table,
      values: {
        status: approve ? "approved" : "rejected",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: approve ? null : reason,
      },
      match: { id },
    }),

  markPrinted: (id: string) =>
    runWrite({
      label: "Mark voucher printed",
      kind: "update",
      table,
      values: { printed: true },
      match: { id },
    }),

  pendingOf: (write: IQueuedWrite): IVoucher | null => {
    const values = queuedInsertOf(write, table);
    if (!values) return null;

    return {
      voucher_no: null,
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      transaction_id: null,
      payable_id: null,
      created_at: queuedAtOf(write),
      ...values,
    } as unknown as IVoucher;
  },
};

export default voucherServices;
