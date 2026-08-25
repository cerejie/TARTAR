import { redirect } from "react-router-dom";
import {
  derivePermissions,
  type IPermissions,
} from "../models/common/permission.model";
import {
  selectRole,
  useAccountStore,
} from "../store/data/account/account.store";

export const permissionLoader =
  (can: keyof IPermissions, fallback: string) => () => {
    const state = useAccountStore.getState();
    if (!state.kind) return null;

    const permissions = derivePermissions(selectRole(state));
    return permissions[can] ? null : redirect(fallback);
  };
