import { z } from "zod";
import {
  approvalStatusSchema,
  userRoleSchema,
} from "../../../enums/role.enum";
import { branchSlugSchema } from "../branch/branch.response";

export const USERNAME_REGEX = /^[a-z0-9]+$/i;

const usernameField = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(40)
  .regex(USERNAME_REGEX, "Username can only contain letters and numbers");

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72);

export const isEmailIdentifier = (value: string): boolean =>
  value.includes("@");

export const registerSchema = z.object({
  username: usernameField,
  password: passwordField,
});
export type IRegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: usernameField,
  password: z.string().min(1, "Password is required"),
});
export type ILoginInput = z.infer<typeof loginSchema>;

export const superAdminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type ISuperAdminLoginInput = z.infer<typeof superAdminLoginSchema>;

export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your username or email")
    .refine(
      (value) =>
        isEmailIdentifier(value)
          ? z.string().email().safeParse(value).success
          : USERNAME_REGEX.test(value),
      "Enter a valid email, or a username with letters and numbers only"
    ),
  password: z.string().min(1, "Password is required"),
});
export type ILoginFormInput = z.infer<typeof loginFormSchema>;

export const createUserSchema = z.object({
  username: usernameField,
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  password: passwordField,
  role: userRoleSchema,
  branch_access: z.array(branchSlugSchema).default([]),
  access_flags: z.record(z.string(), z.boolean()).default({}),
});
export type ICreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().trim().max(120).nullable().optional(),
  role: userRoleSchema.optional(),
  branch_access: z.array(branchSlugSchema).optional(),
  approval_status: approvalStatusSchema.optional(),
  access_flags: z.record(z.string(), z.boolean()).optional(),
});
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({ password: passwordField });
export type IResetPasswordInput = z.infer<typeof resetPasswordSchema>;
