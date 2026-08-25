import dayjs from "dayjs";
import type { LedgerStatus } from "../../../enums/ledger.enum";

interface ILedgerBase {
  id: string;
  branch: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  reference_number: string | null;
  status: LedgerStatus;
  created_by: string | null;
  created_at: string;
}

export interface IReceivable extends ILedgerBase {
  customer_id: string | null;
  customer_name: string;
}

export interface IPayable extends ILedgerBase {
  supplier_id: string | null;
  supplier_name: string;
}

export interface ILedgerRow {
  id: string;
  branch: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  reference_number: string | null;
  status: LedgerStatus;
}

export interface ICustomerLedgerKey {
  customerId: string | null;
  customerName: string;
}

export interface ICustomerReceivableSummary extends ICustomerLedgerKey {
  outstanding: number;
  unpaidCount: number;
  lastTransactionAt: string | null;
}

export const isLedgerOverdue = (row: {
  status: LedgerStatus;
  due_date: string;
}): boolean =>
  row.status !== "paid" && row.due_date < dayjs().format("YYYY-MM-DD");

export const ledgerBalance = (row: {
  amount: number;
  paid_amount: number;
}): number => Number(row.amount) - Number(row.paid_amount);

export const ledgerKeyOf = (customer: ICustomerLedgerKey): string =>
  customer.customerId ?? customer.customerName;
