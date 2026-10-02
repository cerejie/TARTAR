import {
  voucherKindCategory,
  voucherKindLabels,
  type VoucherStatus,
  type VoucherType,
} from "../../../enums/voucher.enum";
import type { DisbursementKind } from "../../../enums/transaction.enum";

export interface IVoucher {
  id: string;
  voucher_no: string | null;
  type: VoucherType;
  branch: string;
  payee: string;
  amount: number;
  purpose: string | null;
  status: VoucherStatus;
  printed: boolean;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason?: string | null;
  created_at: string;
  transaction_id: string | null;
  supplier_id: string | null;
  category: string;
  due_date: string | null;
  payable_id: string | null;
  check_bank: string | null;
  check_number: string | null;
  check_due_date: string | null;
  particulars: string | null;
  gross_amount: number | null;
  ewt_rate: number;
  ewt_amount: number;
  less_return: number;
  vatable: boolean;
  prepared_by_name?: string | null;
  approved_by_name?: string | null;
}

export interface IVoucherSignatories {
  voucher_id: string;
  prepared_by: string | null;
  approved_by: string | null;
}

export const voucherPurpose = (
  voucher: Pick<IVoucher, "purpose" | "category">
): string => {
  if (voucher.purpose) return voucher.purpose;
  return voucher.category === voucherKindCategory.purchase
    ? voucherKindLabels.purchase
    : voucherKindLabels.expense;
};

export const voucherDisbursementKind = (
  voucher: Pick<IVoucher, "category">
): DisbursementKind =>
  voucher.category === voucherKindCategory.purchase ? "purchase" : "expense";
