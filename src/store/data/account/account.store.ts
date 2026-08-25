import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EffectiveRole } from "../../../enums/role.enum";
import { accountStorageKey } from "../../../keys/storage.keys";
import type { IAuthUser } from "../../../models/data/account/account.response";
import { setCustomToken } from "../../../utils/supabase.utils";

export type SessionKind = "superadmin" | "custom";

type States = {
  kind: SessionKind | null;
  user: IAuthUser | null;
  token: string | null;
  superAdminEmail: string | null;
};

type Actions = {
  setCustomSession: (token: string, user: IAuthUser) => void;
  setSuperAdminSession: (email: string) => void;
  clear: () => void;
};

const initialValues: States = {
  kind: null,
  user: null,
  token: null,
  superAdminEmail: null,
};

export const useAccountStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,

      setCustomSession: (token, user) =>
        set({ kind: "custom", token, user, superAdminEmail: null }),

      setSuperAdminSession: (email) =>
        set({
          kind: "superadmin",
          token: null,
          user: null,
          superAdminEmail: email,
        }),

      clear: () => set({ ...initialValues }),
    }),
    {
      name: accountStorageKey,
      partialize: (state) => ({
        kind: state.kind,
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.kind === "custom" && state.token)
          setCustomToken(state.token);
      },
    }
  )
);

const noBranches: string[] = [];

export const selectRole = (state: States): EffectiveRole | null => {
  if (state.kind === "superadmin") return "superadmin";
  return state.user?.role ?? null;
};

export const selectIsAuthenticated = (state: States): boolean =>
  state.kind !== null;

export const selectIsManager = (state: States): boolean =>
  state.kind === "superadmin" || state.user?.role === "admin";

export const selectUserId = (state: States): string | null =>
  state.user?.id ?? null;

export const selectBranchAccess = (state: States): string[] | null => {
  const role = selectRole(state);
  if (role === "superadmin" || role === "admin" || role === "accountant")
    return null;
  return state.user?.branch_access ?? noBranches;
};
