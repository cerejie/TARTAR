import type { PaymentKind, PaymentStatus } from "../../../enums/ledger.enum";

export interface ILedgerPayment {
  id: string;
  kind: PaymentKind;
  customer_id: string | null;
  supplier_id: string | null;
  party_name: string;
  amount: number;
  paid_at: string;
  reference_number: string | null;
  status: PaymentStatus;
  verified_by: string | null;
  verified_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface IPaymentAllocation {
  id: string;
  payment_id: string;
  receivable_id: string | null;
  payable_id: string | null;
  amount: number;
}

export interface IAllocationDraft {
  ledgerId: string;
  amount: number;
}

export interface IPartyFilter {
  partyId?: string | null;
  partyName?: string;
}
