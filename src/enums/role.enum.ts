import { z } from "zod";
import type { StatusColor } from "../models/common/view.model";

export const userRoleValues = [
  "superadmin",
  "admin",
  "accountant",
  "employee",
] as const;
export const userRoleSchema = z.enum(userRoleValues);
export type UserRole = z.infer<typeof userRoleSchema>;

export type AuthorityRole = "developer";

export type EffectiveRole = UserRole | AuthorityRole;

export const userRoleLabels: Record<UserRole, string> = {
  superadmin: "Super Administrator",
  admin: "Admin",
  accountant: "Accountant",
  employee: "Employee",
};

export const effectiveRoleLabels: Record<EffectiveRole, string> = {
  ...userRoleLabels,
  developer: "Developer",
};

const manageableRoles: Record<EffectiveRole, readonly UserRole[]> = {
  developer: ["superadmin", "admin", "accountant", "employee"],
  superadmin: ["admin", "accountant", "employee"],
  admin: ["accountant", "employee"],
  accountant: [],
  employee: [],
};

export const manageableRolesOf = (
  role: EffectiveRole | null
): readonly UserRole[] => (role ? manageableRoles[role] : []);

export const approvalStatusValues = ["pending", "approved", "rejected"] as const;
export const approvalStatusSchema = z.enum(approvalStatusValues);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const approvalStatusColors: Record<ApprovalStatus, StatusColor> = {
  pending: "warning",
  approved: "positive",
  rejected: "negative",
};
