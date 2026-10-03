import { z } from "zod";
import {
  approvalStatusSchema,
  userRoleSchema,
} from "../../../enums/role.enum";
import { branchSlugSchema } from "../branch/branch.response";

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72);

const emailField = z.string().trim().email("Enter a valid email");

const fullNameField = z
  .string()
  .trim()
  .min(1, "Enter the full name")
  .max(120);

const passwordsMatch = (values: {
  password: string;
  confirm_password: string;
}) => values.password === values.confirm_password;

const passwordMismatchIssue = {
  path: ["confirm_password"],
  message: "Passwords do not match",
};

export const registerSchema = z
  .object({
    email: emailField,
    full_name: fullNameField,
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type IRegisterInput = z.infer<typeof registerSchema>;

export const forgotEmailSchema = z.object({ email: emailField });
export type IForgotEmailInput = z.infer<typeof forgotEmailSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    password: passwordField,
    confirm_password: z.string(),
  })
  .refine(passwordsMatch, passwordMismatchIssue);
export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export type ILoginInput = z.infer<typeof loginSchema>;

const hasBranchWhenAdmin = (values: {
  role?: string;
  branch_access?: readonly string[];
}) => values.role !== "admin" || (values.branch_access?.length ?? 0) > 0;

const adminBranchRequiredIssue = {
  path: ["branch_access"],
  message: "Assign at least one branch to an admin",
};

export const createUserSchema = z
  .object({
    email: emailField,
    full_name: fullNameField,
    password: passwordField,
    role: userRoleSchema,
    branch_access: z.array(branchSlugSchema).default([]),
    access_flags: z.record(z.string(), z.boolean()).default({}),
  })
  .refine(hasBranchWhenAdmin, adminBranchRequiredIssue);
export type ICreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    full_name: z.string().trim().max(120).nullable().optional(),
    role: userRoleSchema.optional(),
    branch_access: z.array(branchSlugSchema).optional(),
    approval_status: approvalStatusSchema.optional(),
    access_flags: z.record(z.string(), z.boolean()).optional(),
  })
  .refine(hasBranchWhenAdmin, adminBranchRequiredIssue);
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;

export const approveUserSchema = z
  .object({
    role: userRoleSchema,
    branch_access: z.array(branchSlugSchema).default([]),
  })
  .refine(hasBranchWhenAdmin, adminBranchRequiredIssue);
export type IApproveUserInput = z.infer<typeof approveUserSchema>;

export const resetPasswordSchema = z.object({ password: passwordField });
export type IResetPasswordInput = z.infer<typeof resetPasswordSchema>;
