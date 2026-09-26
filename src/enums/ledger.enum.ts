import { z } from "zod";
import type { ISortOption } from "../models/common/table.model";
import type { StatusColor } from "../models/common/view.model";

export const ledgerStatusValues = ["open", "partial", "paid"] as const;
export const ledgerStatusSchema = z.enum(ledgerStatusValues);
export type LedgerStatus = z.infer<typeof ledgerStatusSchema>;

export const ledgerStatusLabels: Record<LedgerStatus, string> = {
  open: "Open",
  partial: "Partial",
  paid: "Paid",
};

export const ledgerStatusColors: Record<LedgerStatus, StatusColor> = {
  open: "default",
  partial: "warning",
  paid: "positive",
};

export const paymentKindValues = ["receivable", "payable"] as const;
export const paymentKindSchema = z.enum(paymentKindValues);
export type PaymentKind = z.infer<typeof paymentKindSchema>;

export const paymentStatusValues = ["pending", "verified", "rejected"] as const;
export const paymentStatusSchema = z.enum(paymentStatusValues);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentStatusColors: Record<PaymentStatus, StatusColor> = {
  pending: "warning",
  verified: "positive",
  rejected: "negative",
};

const receivablePaymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
};

const payablePaymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending approval",
  verified: "Approved",
  rejected: "Rejected",
};

export const paymentStatusLabels = (
  kind: PaymentKind
): Record<PaymentStatus, string> =>
  kind === "receivable"
    ? receivablePaymentStatusLabels
    : payablePaymentStatusLabels;

export const ledgerStatusFilterValues = ["unpaid", "overdue", "paid"] as const;
export type LedgerStatusFilter = (typeof ledgerStatusFilterValues)[number];

export const ledgerStatusFilterLabels: Record<LedgerStatusFilter, string> = {
  unpaid: "Unpaid",
  overdue: "Overdue",
  paid: "Paid",
};

export const ledgerSortOptions: readonly ISortOption[] = [
  { key: "due-soonest", label: "Due soonest", column: "due_date", direction: "ascending" },
  { key: "due-latest", label: "Due latest", column: "due_date", direction: "descending" },
  { key: "amount-high", label: "Amount: high to low", column: "amount", direction: "descending" },
  { key: "amount-low", label: "Amount: low to high", column: "amount", direction: "ascending" },
];

export const paymentSortOptions: readonly ISortOption[] = [
  { key: "newest", label: "Newest first", column: "paid_at", direction: "descending" },
  { key: "oldest", label: "Oldest first", column: "paid_at", direction: "ascending" },
  { key: "amount-high", label: "Amount: high to low", column: "amount", direction: "descending" },
  { key: "amount-low", label: "Amount: low to high", column: "amount", direction: "ascending" },
];
