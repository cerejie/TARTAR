import { z } from "zod";
import type { StatusColor } from "../models/common/view.model";

export const saleStatusValues = [
  "undeposited",
  "deposited",
  "verified",
  "rejected",
] as const;
export const saleStatusSchema = z.enum(saleStatusValues);
export type SaleStatus = z.infer<typeof saleStatusSchema>;

export const saleStatusLabels: Record<SaleStatus, string> = {
  undeposited: "Undeposited",
  deposited: "Deposited",
  verified: "Verified",
  rejected: "Rejected",
};

export const saleStatusColors: Record<SaleStatus, StatusColor> = {
  undeposited: "default",
  deposited: "warning",
  verified: "positive",
  rejected: "negative",
};

export const openSaleStatuses: readonly SaleStatus[] = [
  "undeposited",
  "rejected",
];
