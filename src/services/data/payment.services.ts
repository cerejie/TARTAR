import type { PaymentKind } from "../../enums/ledger.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { ISortState } from "../../models/common/table.model";
import type { IRecordPaymentInput } from "../../models/data/payment/payment.request";
import type {
  ILedgerPayment,
  IPartyFilter,
} from "../../models/data/payment/payment.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";
import { queuedAtOf, queuedRpcArgsOf } from "../../utils/write.utils";
import type { IQueuedWrite } from "../../models/common/write.model";

const table = "payments";
const reportLimit = 5000;

const defaultSort: ISortState = { column: "paid_at", direction: "descending" };

const partyColumn = (kind: PaymentKind) =>
  kind === "receivable" ? "customer_id" : "supplier_id";

interface IPartyChainable<T> {
  eq: (column: string, value: unknown) => T;
  is: (column: string, value: null) => T;
}

const applyPartyFilter = <T extends IPartyChainable<T>>(
  query: T,
  kind: PaymentKind,
  filters: IPartyFilter
): T => {
  if (filters.partyId) return query.eq(partyColumn(kind), filters.partyId);
  if (filters.partyName)
    return query.is(partyColumn(kind), null).eq("party_name", filters.partyName);

  return query;
};

const paymentServices = {
  getList: async (
    kind: PaymentKind,
    filters: ILedgerFilters = {},
    pagination: IPaginationRequest
  ): Promise<IPaginationResponse<ILedgerPayment>> => {
    let query = supabase
      .from(table)
      .select("*", { count: "exact" })
      .eq("kind", kind);

    if (filters.branch) query = query.eq("branch", filters.branch);
    if (filters.paymentStatus) query = query.eq("status", filters.paymentStatus);
    if (filters.dateFrom) query = query.gte("paid_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("paid_at", filters.dateTo);

    const { from, to } = pageRange(pagination);
    const sort = pagination.sort ?? defaultSort;

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.direction === "ascending" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw toError(error);

    return {
      data: (data ?? []) as ILedgerPayment[],
      currentPage: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: count ?? 0,
    };
  },

  getAll: async (
    kind: PaymentKind,
    filters: IPartyFilter = {}
  ): Promise<ILedgerPayment[]> => {
    const base = supabase.from(table).select("*").eq("kind", kind);
    const query = applyPartyFilter(base, kind, filters);

    const { data, error } = await query
      .order("paid_at", { ascending: false })
      .limit(reportLimit);
    if (error) throw toError(error);

    return (data ?? []) as ILedgerPayment[];
  },

  record: (
    kind: PaymentKind,
    values: IRecordPaymentInput,
    createdBy: string | null
  ) => {
    const amount = values.allocations.reduce(
      (total, allocation) => total + allocation.amount,
      0
    );

    return runWrite({
      label: `Payment ${amount} · ${values.partyName}`,
      kind: "rpc",
      fn: "record_ledger_payment",
      args: {
        p_kind: kind,
        p_party_id: values.partyId,
        p_party_name: values.partyName,
        p_amount: amount,
        p_paid_at: values.paidAt,
        p_reference_number: null,
        p_allocations: values.allocations.map((allocation) => ({
          ledger_id: allocation.ledgerId,
          amount: allocation.amount,
        })),
        p_created_by: createdBy,
      },
    });
  },

  verify: (id: string) =>
    runWrite({
      label: "Verify payment",
      kind: "rpc",
      fn: "verify_payment",
      args: { p_payment_id: id },
    }),

  reject: (id: string) =>
    runWrite({
      label: "Reject payment",
      kind: "rpc",
      fn: "reject_payment",
      args: { p_payment_id: id },
    }),

  pendingOf: (kind: PaymentKind, write: IQueuedWrite): ILedgerPayment | null => {
    const args = queuedRpcArgsOf(write, "record_ledger_payment");
    if (args?.p_kind !== kind) return null;

    return {
      id: write.id,
      kind,
      customer_id: kind === "receivable" ? args.p_party_id : null,
      supplier_id: kind === "payable" ? args.p_party_id : null,
      party_name: args.p_party_name,
      amount: args.p_amount,
      paid_at: args.p_paid_at,
      reference_number: args.p_reference_number,
      status: "pending",
      verified_by: null,
      verified_at: null,
      created_by: args.p_created_by,
      created_at: queuedAtOf(write),
      branch: "",
    } as unknown as ILedgerPayment;
  },
};

export default paymentServices;
