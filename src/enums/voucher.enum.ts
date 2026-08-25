import { z } from "zod";

export const voucherTypeValues = ["check", "cash"] as const;
export const voucherTypeSchema = z.enum(voucherTypeValues);
export type VoucherType = z.infer<typeof voucherTypeSchema>;

export const voucherTypeLabels: Record<VoucherType, string> = {
  check: "Check",
  cash: "Cash",
};

export const voucherStatusValues = ["pending", "approved", "rejected"] as const;
export const voucherStatusSchema = z.enum(voucherStatusValues);
export type VoucherStatus = z.infer<typeof voucherStatusSchema>;

export const voucherStatusLabels: Record<VoucherStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const voucherStatusColors: Record<VoucherStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export const voucherKindValues = ["expense", "purchase"] as const;
export const voucherKindSchema = z.enum(voucherKindValues);
export type VoucherKind = z.infer<typeof voucherKindSchema>;

export const voucherKindLabels: Record<VoucherKind, string> = {
  expense: "Expense",
  purchase: "Purchase",
};

export const voucherKindCategory = {
  expense: "EXP",
  purchase: "PUR",
} as const satisfies Record<VoucherKind, string>;
