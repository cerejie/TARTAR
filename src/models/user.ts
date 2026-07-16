import { z } from 'zod'
import { approvalStatusSchema, userRoleSchema, type UserRole } from './enums'
import { branchSlugSchema } from './branch'

/**
 * Custom users (Admin, Accountant, Employee, ...). The superAdmin is NOT here —
 * it is the sole Supabase Auth account and is represented at runtime only.
 * `access_flags` is a free-form JSON bag of per-user feature toggles.
 */
export interface User {
  id: string
  username: string
  full_name: string | null
  role: UserRole
  access_flags: Record<string, boolean>
  approval_status: z.infer<typeof approvalStatusSchema>
  branch_access: string[]
  created_at: string
  updated_at: string
}

/** Public profile returned by the login RPC (no password hash). */
export interface AuthUser {
  id: string
  username: string
  full_name: string | null
  role: UserRole
  access_flags: Record<string, boolean>
  branch_access: string[]
}

/** Username pattern for regular users: letters and numbers only (no '@', spaces,
 *  dots, dashes or other symbols). An email is therefore never a valid username —
 *  only the superAdmin authenticates by email. Kept in sync with the DB CHECK
 *  constraint in the `username_rules` migration. */
export const USERNAME_REGEX = /^[a-z0-9]+$/i

const usernameField = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(40)
  .regex(USERNAME_REGEX, 'Username can only contain letters and numbers')

const passwordField = z.string().min(6, 'Password must be at least 6 characters').max(72)

/** Self-registration form (public.register). Creates a PENDING employee.
 *  Only a username and password are collected. */
export const registerSchema = z.object({
  username: usernameField,
  password: passwordField,
})
export type RegisterInput = z.infer<typeof registerSchema>

/** Custom-user login form (public.login). */
export const loginSchema = z.object({
  username: usernameField,
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof loginSchema>

/** superAdmin (Developer) email/password login handled by Supabase Auth. */
export const superAdminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
export type SuperAdminLoginInput = z.infer<typeof superAdminLoginSchema>

/** An identifier is treated as the superAdmin's email login iff it contains '@'
 *  (usernames can never contain one). Used to auto-route the single login form. */
export const isEmailIdentifier = (value: string): boolean => value.includes('@')

/**
 * Unified login form (build spec §4). One identifier field auto-detects the
 * login type — no tabs, no role selector: an email signs the superAdmin in via
 * Supabase Auth; anything else is treated as a regular username.
 */
export const loginFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your username or email')
    .refine(
      (v) => (isEmailIdentifier(v) ? z.string().email().safeParse(v).success : USERNAME_REGEX.test(v)),
      'Enter a valid email, or a username with letters and numbers only',
    ),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormInput = z.infer<typeof loginFormSchema>

/** Admin/superAdmin creating an already-approved user (public.admin_create_user). */
export const createUserSchema = z.object({
  username: usernameField,
  full_name: z.string().trim().max(120).optional().or(z.literal('')),
  password: passwordField,
  role: userRoleSchema,
  branch_access: z.array(branchSlugSchema).default([]),
  access_flags: z.record(z.string(), z.boolean()).default({}),
})
export type CreateUserInput = z.infer<typeof createUserSchema>

/** Editing an existing user's role / branch / approval (no password here). */
export const updateUserSchema = z.object({
  full_name: z.string().trim().max(120).nullable().optional(),
  role: userRoleSchema.optional(),
  branch_access: z.array(branchSlugSchema).optional(),
  approval_status: approvalStatusSchema.optional(),
  access_flags: z.record(z.string(), z.boolean()).optional(),
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>

/** Reset password (public.admin_set_password). */
export const resetPasswordSchema = z.object({ password: passwordField })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
