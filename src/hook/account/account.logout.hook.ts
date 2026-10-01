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
import { releasePushSubscription } from "../common/push.hook";

export const endSession = async (pathname: string): Promise<void> => {
  resetLocation(isAdminPath(pathname) ? adminBasePath : "/");
  useAccountStore.getState().clear();
  useQueryStore.getState().reset();
  resetAllStores();
  await releasePushSubscription();
  await accountServices.logout();
};

export const useAccountLogoutHook = () => {
  const { pathname } = useLocation();

  const logoutMutation = useMutation(() => endSession(pathname));

  return { logoutMutation };
};
