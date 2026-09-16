import type { LedgerStatus, PaymentStatus } from "../../enums/ledger.enum";
import type { TransactionType } from "../../enums/transaction.enum";

export type ILedgerFilterScope =
  | "page"
  | "customer-ledger"
  | "ledger"
  | "payments";

export interface ILedgerFilters {
  branch?: string;
  farmSection?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  referenceNumber?: string;
  search?: string;
  customerId?: string;
  supplierId?: string;
  status?: LedgerStatus | "overdue" | "unpaid";
  paymentStatus?: PaymentStatus;
  type?: TransactionType;
}

export interface IFilterColumns {
  date: string;
  amount?: string;
  type?: string;
  search?: string;
}
