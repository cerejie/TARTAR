import { z } from "zod";
import type { ISortOption } from "../models/common/table.model";
import type { StatusColor } from "../models/common/view.model";

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

export const voucherStatusColors: Record<VoucherStatus, StatusColor> = {
  pending: "warning",
  approved: "positive",
  rejected: "negative",
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

export const voucherSortOptions: readonly ISortOption[] = [
  { key: "newest", label: "Newest first", column: "created_at", direction: "descending" },
  { key: "oldest", label: "Oldest first", column: "created_at", direction: "ascending" },
  { key: "amount-high", label: "Amount: high to low", column: "amount", direction: "descending" },
  { key: "amount-low", label: "Amount: low to high", column: "amount", direction: "ascending" },
];
