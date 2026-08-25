import type { PaymentKind } from "../../enums/ledger.enum";
import type { IRecordPaymentInput } from "../../models/data/payment/payment.request";
import type {
  ILedgerPayment,
  IPartyFilter,
} from "../../models/data/payment/payment.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "payments";

const partyColumn = (kind: PaymentKind) =>
  kind === "receivable" ? "customer_id" : "supplier_id";

const paymentServices = {
  getList: async (
    kind: PaymentKind,
    filters: IPartyFilter = {}
  ): Promise<ILedgerPayment[]> => {
    let query = supabase.from(table).select("*").eq("kind", kind);

    if (filters.partyId) {
      query = query.eq(partyColumn(kind), filters.partyId);
    } else if (filters.partyName) {
      query = query
        .is(partyColumn(kind), null)
        .eq("party_name", filters.partyName);
    }

    const { data, error } = await query
      .order("paid_at", { ascending: false })
      .limit(300);
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
