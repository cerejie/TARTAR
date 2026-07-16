import { useAuthStore, selectRole } from '../stores/auth.store'
import type { EffectiveRole } from '../models'

/**
 * Capability flags derived from the effective role (build spec §5). Deriving in
 * one place keeps role logic out of components and out of route guards.
 *
 *   superAdmin → everything (incl. managing admins)
 *   Admin      → full business control; manage NON-admin users
 *   Accountant → view Expenses & Income (BIR); NOT financial standing
 *   Employee   → encode transactions, view reminders; NOT financial standing
 */
export interface Permissions {
  role: EffectiveRole | null
  isManager: boolean
  /** Current Cash / Bank / financial standing — managers only. */
  viewFinancialStanding: boolean
  /** Admin dashboard, branch monitoring, reports — managers only. */
  viewDashboard: boolean
  viewBranchMonitoring: boolean
  /** Income & Expenses views (for BIR) — accountant + managers. */
  viewIncomeExpenses: boolean
  /** Encode transactions — employees + managers. */
  encodeTransactions: boolean
  /** Reminders / due alerts — everyone signed in. */
  viewReminders: boolean
  /** Create vouchers — employees + managers. */
  createVouchers: boolean
  /** Approve/reject + release vouchers for printing — managers only. */
  approveVouchers: boolean
  /** Manage users at all (has a Users tab). */
  manageUsers: boolean
  /** Assign/modify the admin role or other admins — superAdmin only. */
  manageAdmins: boolean
}

export function usePermissions(): Permissions {
  const role = useAuthStore(selectRole)
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin'
  const isManager = isSuperAdmin || isAdmin
  const isAccountant = role === 'accountant'
  const isEmployee = role === 'employee'

  return {
    role,
    isManager,
    viewFinancialStanding: isManager,
    viewDashboard: isManager,
    viewBranchMonitoring: isManager,
    viewIncomeExpenses: isManager || isAccountant,
    encodeTransactions: isManager || isEmployee,
    viewReminders: role !== null,
    createVouchers: isManager || isEmployee,
    approveVouchers: isManager,
    manageUsers: isManager,
    manageAdmins: isSuperAdmin,
  }
}
