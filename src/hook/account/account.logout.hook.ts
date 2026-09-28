import { useLocation } from "react-router-dom";
import accountServices from "../../services/data/account.services";
import { useQueryStore } from "../../store/common/query.store";
import { resetAllStores } from "../../store/common/reset.store";
import { useAccountStore } from "../../store/data/account/account.store";
import {
  adminBasePath,
  isAdminPath,
  resetLocation,
} from "../../utils/route.utils";
import { useMutation } from "../common/mutation.hook";

export const useAccountLogoutHook = () => {
  const { pathname } = useLocation();
  const clear = useAccountStore((state) => state.clear);
  const resetCache = useQueryStore((state) => state.reset);

  const logoutMutation = useMutation(async () => {
    resetLocation(isAdminPath(pathname) ? adminBasePath : "/");
    clear();
    resetCache();
    resetAllStores();
    await accountServices.logout();
  });

  return { logoutMutation };
};
