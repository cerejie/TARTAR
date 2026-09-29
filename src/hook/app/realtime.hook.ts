import { useEffect } from "react";
import { liveRefreshKeys } from "../../keys/query.keys";
import realtimeServices from "../../services/data/realtime.services";
import {
  selectIsManager,
  useAccountStore,
} from "../../store/data/account/account.store";
import { useInvalidate } from "../common/query.hook";

const liveRefreshDelayMs = 500;

export const useRealtimeRefreshHook = () => {
  const isManager = useAccountStore(selectIsManager);
  const invalidate = useInvalidate();

  useEffect(() => {
    if (!isManager) return;

    let pending: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      clearTimeout(pending);
      pending = setTimeout(
        () => liveRefreshKeys.forEach((key) => invalidate(key)),
        liveRefreshDelayMs
      );
    };

    const unsubscribe = realtimeServices.subscribeTransactions(refresh);

    return () => {
      clearTimeout(pending);
      unsubscribe();
    };
  }, [isManager, invalidate]);
};
