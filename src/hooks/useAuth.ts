import { useCallback } from 'react'
import {
  useAuthStore,
  selectRole,
  selectIsAuthenticated,
  selectIsManager,
  selectBranchAccess,
} from '../stores/auth.store'
import { useQueryStore } from '../stores/query.store'
import * as authService from '../services/auth.service'
import type { LoginInput, SuperAdminLoginInput } from '../models'

/**
 * The single entry point for authentication state + actions. Wraps the auth
 * store and auth service so components never touch the Supabase client directly.
 */
export function useAuth() {
  const kind = useAuthStore((s) => s.kind)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore(selectRole)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isManager = useAuthStore(selectIsManager)
  const branchAccess = useAuthStore(selectBranchAccess)

  const setCustomSession = useAuthStore((s) => s.setCustomSession)
  const setSuperAdminSession = useAuthStore((s) => s.setSuperAdminSession)
  const clear = useAuthStore((s) => s.clear)
  const resetCache = useQueryStore((s) => s.reset)

  const loginCustom = useCallback(
    async (input: LoginInput) => {
      const { token, user: profile } = await authService.loginCustomUser(input)
      setCustomSession(token, profile)
    },
    [setCustomSession],
  )

  const loginSuperAdmin = useCallback(
    async (input: SuperAdminLoginInput) => {
      await authService.loginSuperAdmin(input)
      setSuperAdminSession(input.email)
    },
    [setSuperAdminSession],
  )

  const register = authService.register

  const logout = useCallback(async () => {
    // Clear local session state first so the redirect is instant and works even
    // offline; the persist middleware wipes the stored token as `clear` runs.
    clear()
    resetCache() // drop cached data so the next user starts clean
    await authService.logout() // best-effort remote sign-out (may be slow/offline)
  }, [clear, resetCache])

  return {
    kind,
    user,
    role,
    isAuthenticated,
    isManager,
    branchAccess,
    loginCustom,
    loginSuperAdmin,
    register,
    logout,
  }
}
