import type { SaleStatus } from "../../../enums/sale.enum";
import {
  disbursementKindValues,
  type CashAccount,
  type DisbursementKind,
  type TransactionType,
} from "../../../enums/transaction.enum";
import type { ILedgerRow } from "../ledger/ledger.response";
import { isVerifiedSale } from "../sale/sale.response";
import type { IVoucher } from "../voucher/voucher.response";

export interface ITransaction {
  id: string;
  type: TransactionType;
  branch: string;
  farm_section: string | null;
  txn_date: string;
  amount: number;
  reference_number: string | null;
  description: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  cash_account: CashAccount | null;
  bank_account_id: string | null;
  income_source: string | null;
  expense_type: string | null;
  due_date: string | null;
  sale_status?: SaleStatus | null;
  created_by: string | null;
  created_at: string;
  customer?: { name: string } | null;
  supplier?: { name: string } | null;
}

export interface ITransactionSummary {
  cashIn: number;
  cashOut: number;
  net: number;
  sales: number;
}

export type IDisbursementPayable = Pick<
  ILedgerRow,
  "status" | "amount" | "paid_amount"
>;

export interface IDisbursement extends ITransaction {
  voucher: IVoucher | null;
  payable?: IDisbursementPayable | null;
}

type ICountedVoucher = Pick<IVoucher, "status" | "amount">;

type ICountedRow = Pick<ITransaction, "type" | "amount" | "sale_status"> & {
  voucher: ICountedVoucher | null;
};

export const isDisbursementType = (
  type: TransactionType
): type is DisbursementKind =>
  (disbursementKindValues as readonly TransactionType[]).includes(type);

export const isCountedDisbursement = (row: { voucher: ICountedVoucher | null }) =>
  row.voucher?.status !== "rejected";

export const amountToPayOf = (row: ICountedRow) =>
  Number(row.voucher?.amount ?? row.amount);

export const countedAmountOf = (row: ICountedRow): number => {
  if (row.type === "sale") return isVerifiedSale(row) ? Number(row.amount) : 0;
  if (!isDisbursementType(row.type)) return Number(row.amount);
  return isCountedDisbursement(row) ? amountToPayOf(row) : 0;
};

export const sumCounted = (rows: readonly ICountedRow[]) =>
  rows.reduce((total, row) => total + countedAmountOf(row), 0);

export interface IPurchaseSummary {
  total: number;
  outstanding: number;
  paid: number;
  pendingVouchers: number;
}

export interface IExpenseCategoryTotal {
  label: string;
  amount: number;
}

export interface IExpenseSummary {
  total: number;
  topCategory: IExpenseCategoryTotal | null;
  records: number;
  pendingVouchers: number;
}

export interface ITransactionAudit {
  id: string;
  transaction_id: string;
  edited_by: string | null;
  edited_at: string;
  changes: Record<string, { old: unknown; new: unknown }>;
}
