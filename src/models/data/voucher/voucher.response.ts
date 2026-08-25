import {
  voucherKindCategory,
  voucherKindLabels,
  type VoucherStatus,
  type VoucherType,
} from "../../../enums/voucher.enum";

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
  created_at: string;
  transaction_id: string | null;
  supplier_id: string | null;
  category: string;
  due_date: string | null;
  payable_id: string | null;
  check_bank: string | null;
  check_number: string | null;
  check_due_date: string | null;
}

export const voucherPurpose = (
  voucher: Pick<IVoucher, "purpose" | "category">
): string => {
  if (voucher.purpose) return voucher.purpose;
  if (voucher.category === voucherKindCategory.purchase)
    return voucherKindLabels.purchase;
  if (voucher.category === voucherKindCategory.expense)
    return voucherKindLabels.expense;
  return "—";
};
