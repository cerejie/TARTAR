import { useEffect } from "react";
import { liveRefreshKeys } from "../../keys/query.keys";
import realtimeServices from "../../services/data/realtime.services";
import {
  selectIsAuthenticated,
  useAccountStore,
} from "../../store/data/account/account.store";
import { useInvalidate } from "../common/query.hook";

const liveRefreshDelayMs = 500;

export const useRealtimeRefreshHook = () => {
  const isAuthenticated = useAccountStore(selectIsAuthenticated);
  const invalidate = useInvalidate();

  useEffect(() => {
    if (!isAuthenticated) return;

    let pending: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      clearTimeout(pending);
      pending = setTimeout(
        () => liveRefreshKeys.forEach((key) => invalidate(key)),
        liveRefreshDelayMs
      );
    };

    const unsubscribe = realtimeServices.subscribeLedgerChanges(refresh);

    return () => {
      clearTimeout(pending);
      unsubscribe();
    };
  }, [isAuthenticated, invalidate]);
};
