import { z } from "zod";

export const userRoleValues = ["admin", "accountant", "employee"] as const;
export const userRoleSchema = z.enum(userRoleValues);
export type UserRole = z.infer<typeof userRoleSchema>;

export type EffectiveRole = UserRole | "superadmin";

export const userRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  accountant: "Accountant",
  employee: "Employee",
};

export const approvalStatusValues = ["pending", "approved", "rejected"] as const;
export const approvalStatusSchema = z.enum(approvalStatusValues);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const approvalStatusColors: Record<ApprovalStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};
