import { useEffect } from "react";
import { toast } from "sonner";
import accountServices from "../../services/data/account.services";
import {
  selectIsAuthenticated,
  useAccountStore,
} from "../../store/data/account/account.store";
import { endSession } from "./account.logout.hook";

const sessionExpiredMessage = "Your session expired. Sign in again.";

const handleSessionExpired = (): void => {
  if (!selectIsAuthenticated(useAccountStore.getState())) return;

  toast.error(sessionExpiredMessage);
  void endSession(window.location.pathname);
};

export const useAccountExpiryHook = () => {
  useEffect(() => {
    accountServices.onSessionExpired(handleSessionExpired);
    return () => accountServices.onSessionExpired(null);
  }, []);
};
