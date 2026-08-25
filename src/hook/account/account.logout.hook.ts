import accountServices from "../../services/data/account.services";
import { useQueryStore } from "../../store/common/query.store";
import { resetAllStores } from "../../store/common/reset.store";
import { useAccountStore } from "../../store/data/account/account.store";
import { resetLocation } from "../../utils/route.utils";
import { useMutation } from "../common/mutation.hook";

export const useAccountLogoutHook = () => {
  const clear = useAccountStore((state) => state.clear);
  const resetCache = useQueryStore((state) => state.reset);

  const logoutMutation = useMutation(async () => {
    resetLocation("/");
    clear();
    resetCache();
    resetAllStores();
    await accountServices.logout();
  });

  return { logoutMutation };
};
