import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthorityRole, EffectiveRole } from "../../../enums/role.enum";
import { accountStorageKey } from "../../../keys/storage.keys";
import type { IAuthUser } from "../../../models/data/account/account.response";
import { setCustomToken } from "../../../utils/supabase.utils";

export type SessionKind = AuthorityRole | "custom";

type States = {
  kind: SessionKind | null;
  user: IAuthUser | null;
  token: string | null;
  developerEmail: string | null;
};

type Actions = {
  setCustomSession: (token: string, user: IAuthUser) => void;
  setDeveloperSession: (email: string) => void;
  addBranchAccess: (slug: string) => void;
  clear: () => void;
};

const initialValues: States = {
  kind: null,
  user: null,
  token: null,
  developerEmail: null,
};

export const useAccountStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,

      setCustomSession: (token, user) =>
        set({ kind: "custom", token, user, developerEmail: null }),

      setDeveloperSession: (email) =>
        set({
          kind: "developer",
          token: null,
          user: null,
          developerEmail: email,
        }),

      addBranchAccess: (slug) =>
        set((state) =>
          state.user && !state.user.branch_access.includes(slug)
            ? {
                user: {
                  ...state.user,
                  branch_access: [...state.user.branch_access, slug],
                },
              }
            : {}
        ),

      clear: () => set({ ...initialValues }),
    }),
    {
      name: accountStorageKey,
      partialize: (state) => ({
        kind: state.kind,
        user: state.user,
        token: state.token,
        developerEmail: state.developerEmail,
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
  if (state.kind === "developer") return "developer";
  return state.user?.role ?? null;
};

const selectIsSuperAdmin = (state: States): boolean => {
  const role = selectRole(state);
  return role === "developer" || role === "superadmin";
};

export const selectIsAuthenticated = (state: States): boolean =>
  state.kind !== null;

export const selectIsManager = (state: States): boolean =>
  selectIsSuperAdmin(state) || state.user?.role === "admin";

export const selectCanScopeBranch = (state: States): boolean =>
  selectIsManager(state) || state.user?.role === "accountant";

export const selectUserId = (state: States): string | null =>
  state.user?.id ?? null;

export const selectBranchAccess = (state: States): string[] | null => {
  if (selectIsSuperAdmin(state)) return null;
  return state.user?.branch_access ?? noBranches;
};
