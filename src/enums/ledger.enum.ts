import { z } from "zod";

export const ledgerStatusValues = ["open", "partial", "paid"] as const;
export const ledgerStatusSchema = z.enum(ledgerStatusValues);
export type LedgerStatus = z.infer<typeof ledgerStatusSchema>;

export const ledgerStatusLabels: Record<LedgerStatus, string> = {
  open: "Open",
  partial: "Partial",
  paid: "Paid",
};

export const ledgerStatusColors: Record<LedgerStatus, string> = {
  open: "default",
  partial: "gold",
  paid: "green",
};

export const paymentKindValues = ["receivable", "payable"] as const;
export const paymentKindSchema = z.enum(paymentKindValues);
export type PaymentKind = z.infer<typeof paymentKindSchema>;

export const paymentStatusValues = ["pending", "verified", "rejected"] as const;
export const paymentStatusSchema = z.enum(paymentStatusValues);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "gold",
  verified: "green",
  rejected: "red",
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
