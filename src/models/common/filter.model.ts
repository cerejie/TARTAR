import type { LedgerStatus } from "../../enums/ledger.enum";

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
}

export interface IFilterColumns {
  date: string;
  amount?: string;
}
