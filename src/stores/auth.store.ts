import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { restoreCustomToken } from '../services/auth.service'
import type { AuthUser, EffectiveRole } from '../models'

/**
 * The signed-in identity (build spec §4). Two kinds of session:
 *   - 'superadmin' : a real Supabase Auth session (no custom token/user row).
 *   - 'custom'     : Admin/Accountant/Employee — carries our own JWT + profile.
 *
 * The custom token is persisted so a reload (or offline boot) keeps the user
 * signed in; on rehydrate we re-inject it into the Supabase client.
 */
type SessionKind = 'superadmin' | 'custom'

interface AuthState {
  kind: SessionKind | null
  user: AuthUser | null // null for superAdmin
  token: string | null // custom JWT; null for superAdmin
  superAdminEmail: string | null

  setCustomSession: (token: string, user: AuthUser) => void
  setSuperAdminSession: (email: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      kind: null,
      user: null,
      token: null,
      superAdminEmail: null,

      setCustomSession: (token, user) =>
        set({ kind: 'custom', token, user, superAdminEmail: null }),

      setSuperAdminSession: (email) =>
        set({ kind: 'superadmin', token: null, user: null, superAdminEmail: email }),

      clear: () => set({ kind: null, user: null, token: null, superAdminEmail: null }),
    }),
    {
      name: 'tartar-auth',
      // superAdmin sessions are owned by supabase.auth; only persist the custom bits.
      partialize: (s) => ({ kind: s.kind, user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.kind === 'custom' && state.token) restoreCustomToken(state.token)
      },
    },
  ),
)

// --- Derived selectors (never duplicate role logic in components) ------------

/** The effective role including the runtime-only superAdmin. */
export function selectRole(s: AuthState): EffectiveRole | null {
  if (s.kind === 'superadmin') return 'superadmin'
  return s.user?.role ?? null
}

export const selectIsAuthenticated = (s: AuthState): boolean => s.kind !== null
export const selectIsManager = (s: AuthState): boolean =>
  s.kind === 'superadmin' || s.user?.role === 'admin'

/** null = every branch (superAdmin, Admin, Accountant); otherwise the assigned slugs. */
export function selectBranchAccess(s: AuthState): string[] | null {
  const role = selectRole(s)
  if (role === 'superadmin' || role === 'admin' || role === 'accountant') return null
  return s.user?.branch_access ?? []
}
