import {
  derivePermissions,
  type IPermissions,
} from "../../models/common/permission.model";
import {
  selectRole,
  useAccountStore,
} from "../../store/data/account/account.store";

export const usePermissions = (): IPermissions => {
  const role = useAccountStore(selectRole);
  return derivePermissions(role);
};
