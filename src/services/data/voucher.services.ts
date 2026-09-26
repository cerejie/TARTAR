import { voucherKindCategory } from "../../enums/voucher.enum";
import type { IFilterColumns, ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import type { IVoucherInput } from "../../models/data/voucher/voucher.request";
import type { IVoucher } from "../../models/data/voucher/voucher.response";
import { runWrite } from "../../store/common/sync.store";
import { applyLedgerFilters } from "../../utils/filter.utils";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "vouchers";

const voucherColumns: IFilterColumns = {
  date: "created_at",
  amount: "amount",
  search: "payee",
};

const defaultSort: ISortState = { column: "created_at", direction: "descending" };

const voucherServices = {
  getList: async (
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<IVoucher>> => {
    const base = supabase.from(table).select("*", { count: "exact" });
    const filtered = applyLedgerFilters(base, filters, voucherColumns);
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
      data: (data ?? []) as IVoucher[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  create: (values: IVoucherInput, createdBy: string | null) => {
    const isPurchase = values.kind === "purchase";
    const isCheck = values.type === "check";

    return runWrite({
      label: `Voucher for ${values.payee} · ${values.amount}`,
      kind: "insert",
      table,
      values: {
        type: values.type,
        branch: values.branch,
        payee: values.payee,
        amount: values.amount,
        purpose: null,
        category: voucherKindCategory[values.kind],
        supplier_id: isPurchase ? values.supplier_id ?? null : null,
        due_date: isPurchase ? values.due_date ?? null : null,
        check_bank: isCheck ? values.check_bank ?? null : null,
        check_number: isCheck ? values.check_number ?? null : null,
        check_due_date: isCheck ? values.check_due_date ?? null : null,
        status: "pending",
        printed: false,
        created_by: createdBy,
      },
    });
  },

  decide: (id: string, approve: boolean, approverId: string | null) =>
    runWrite({
      label: `${approve ? "Approve" : "Reject"} voucher`,
      kind: "update",
      table,
      values: {
        status: approve ? "approved" : "rejected",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
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
};

export default voucherServices;
