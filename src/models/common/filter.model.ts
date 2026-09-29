import type {
  LedgerStatus,
  LedgerStatusFilter,
  PayableStatus,
  PaymentStatus,
} from "../../enums/ledger.enum";
import type { SaleStatus } from "../../enums/sale.enum";
import type {
  PurchaseDateBasis,
  TransactionType,
} from "../../enums/transaction.enum";
import type { VoucherStatus } from "../../enums/voucher.enum";

export type ILedgerFilterScope =
  | "page"
  | "customer-ledger"
  | "supplier-ledger"
  | "ledger"
  | "payables"
  | "payments"
  | "vouchers";

export interface ILedgerFilters {
  branch?: string;
  farmSection?: string;
  dateFrom?: string;
  dateTo?: string;
  dateBasis?: PurchaseDateBasis;
  amountMin?: number;
  amountMax?: number;
  referenceNumber?: string;
  search?: string;
  customerId?: string;
  supplierId?: string;
  status?: LedgerStatus | LedgerStatusFilter | PayableStatus;
  paymentStatus?: PaymentStatus;
  voucherStatus?: VoucherStatus;
  saleStatus?: SaleStatus;
  type?: TransactionType;
}

export interface IFilterColumns {
  date: string;
  amount?: string;
  type?: string;
  search?: string;
}
