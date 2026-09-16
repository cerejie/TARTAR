import type { PaymentKind } from "../../enums/ledger.enum";
import type { ILedgerFilters } from "../../models/common/filter.model";
import {
  pageRange,
  type IPaginationRequest,
  type IPaginationResponse,
} from "../../models/common/pagination.model";
import type { IRecordPaymentInput } from "../../models/data/payment/payment.request";
import type {
  ILedgerPayment,
  IPartyFilter,
} from "../../models/data/payment/payment.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "payments";
const reportLimit = 5000;

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

    if (filters.paymentStatus) query = query.eq("status", filters.paymentStatus);
    if (filters.dateFrom) query = query.gte("paid_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("paid_at", filters.dateTo);

    const { from, to } = pageRange(pagination);

    const { data, error, count } = await query
      .order("paid_at", { ascending: false })
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
        p_reference_number: values.referenceNumber,
        p_allocations: values.allocations.map((allocation) => ({
          ledger_id: allocation.ledgerId,
          amount: allocation.amount,
        })),
        p_created_by: createdBy,
      },
    });
  },

  verify: (id: string, verifierId: string | null) =>
    runWrite({
      label: "Verify payment",
      kind: "update",
      table,
      values: {
        status: "verified",
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
      },
      match: { id, status: "pending" },
    }),

  reject: (id: string) =>
    runWrite({
      label: "Reject payment",
      kind: "rpc",
      fn: "reject_payment",
      args: { p_payment_id: id },
    }),
};

export default paymentServices;
