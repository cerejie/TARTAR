import { supabase, setCustomToken, toError } from './supabase'
import type {
  AuthUser,
  CreateUserInput,
  LoginInput,
  RegisterInput,
  SuperAdminLoginInput,
} from '../models'

/**
 * Authentication service (build spec §4). Two distinct flows:
 *   1. superAdmin  → real Supabase Auth (email/password).
 *   2. everyone else → custom `public.login` RPC returning a signed JWT that we
 *      inject on subsequent requests via setCustomToken().
 */

export interface CustomLoginResult {
  token: string
  user: AuthUser
}

/** Custom-user login (Admin / Accountant / Employee). */
export async function loginCustomUser(input: LoginInput): Promise<CustomLoginResult> {
  const { data, error } = await supabase.rpc('login', {
    p_username: input.username,
    p_password: input.password,
  })
  if (error) throw toError(error)

  const result = data as CustomLoginResult
  setCustomToken(result.token)
  return result
}

/** superAdmin (Developer) login via Supabase Auth. */
export async function loginSuperAdmin(input: SuperAdminLoginInput) {
  setCustomToken(null) // ensure no stale custom token shadows the Auth session
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) throw toError(error)
  return data
}

/** Re-apply a persisted custom token on app boot (read-only offline support). */
export function restoreCustomToken(token: string | null): void {
  setCustomToken(token)
}

/** Self-registration → creates a PENDING employee awaiting approval. Only a
 *  username and password are collected; the profile name is filled in later. */
export async function register(input: RegisterInput): Promise<void> {
  const { error } = await supabase.rpc('register', {
    p_username: input.username,
    p_password: input.password,
    p_full_name: null,
  })
  if (error) throw toError(error)
}

/** Sign out of whichever session is active and clear the custom token. */
export async function logout(): Promise<void> {
  setCustomToken(null)
  await supabase.auth.signOut().catch(() => undefined)
}

/**
 * Create an already-approved user (public.admin_create_user). Either manager
 * may assign any role, admins included — enforced server-side.
 */
export async function createUser(input: CreateUserInput): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_user', {
    p_username: input.username,
    p_password: input.password,
    p_full_name: input.full_name?.trim() || null,
    p_role: input.role,
    p_branch_access: input.branch_access,
    p_access_flags: input.access_flags,
  })
  if (error) throw toError(error)
  return data as string
}

/** Reset a user's password (public.admin_set_password). */
export async function setUserPassword(userId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_password', {
    p_user_id: userId,
    p_password: password,
  })
  if (error) throw toError(error)
}
