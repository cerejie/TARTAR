import type { LedgerStatus } from "../../enums/ledger.enum";
import type { TransactionType } from "../../enums/transaction.enum";

export type ILedgerFilterScope = "page" | "customer-ledger";

export interface ILedgerFilters {
  branch?: string;
  farmSection?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  referenceNumber?: string;
  customerId?: string;
  supplierId?: string;
  status?: LedgerStatus | "overdue";
  type?: TransactionType;
}

export interface IFilterColumns {
  date: string;
  amount?: string;
  type?: string;
}
