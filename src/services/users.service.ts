import { supabase, toError } from './supabase'
import { runWrite } from '../stores/sync.store'
import type { ApprovalStatus, UpdateUserInput, User } from '../models'

/**
 * Users management (build spec §4). The Admin's Users tab and the superAdmin's
 * user admin both read/write here; RLS decides who may see/modify whom (Admin =
 * non-admin users only; superAdmin = everyone). Creating users and resetting
 * passwords go through RPCs in auth.service (server-side hashing).
 */
export async function listUsers(status?: ApprovalStatus): Promise<User[]> {
  let query = supabase
    .from('users')
    .select('id, username, full_name, role, access_flags, approval_status, branch_access, created_at, updated_at')
  if (status) query = query.eq('approval_status', status)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw toError(error)
  return (data ?? []) as User[]
}

/** Update role / branches / approval / flags (no password). */
export async function updateUser(id: string, patch: UpdateUserInput) {
  return runWrite({ label: 'Update user', kind: 'update', table: 'users', values: patch, match: { id } })
}

/** Approve or reject a pending registration. */
export async function setApproval(id: string, status: ApprovalStatus) {
  return runWrite({
    label: `${status} user`,
    kind: 'update',
    table: 'users',
    values: { approval_status: status },
    match: { id },
  })
}

export async function deleteUser(id: string) {
  return runWrite({ label: 'Delete user', kind: 'delete', table: 'users', match: { id } })
}
