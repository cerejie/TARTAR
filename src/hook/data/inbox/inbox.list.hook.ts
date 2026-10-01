import { useNavigate } from "react-router-dom";
import { inboxListKey, scopedKey } from "../../../keys/query.keys";
import inboxServices from "../../../services/data/inbox.services";
import {
  selectIsAuthenticated,
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";

import type { IInboxItem } from "../../../models/data/inbox/inbox.response";

const markReadQueuedMessage = "Marked read — will sync when back online";

export const useInboxListHook = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAccountStore(selectIsAuthenticated);
  const userId = useAccountStore(selectUserId);

  const inboxQuery = useQuery<IInboxItem[]>(
    scopedKey(inboxListKey, userId),
    () => inboxServices.getList(),
    { enabled: isAuthenticated }
  );

  const markReadMutation = useMutation(
    (ids: readonly string[] | null) => inboxServices.markRead(ids),
    { invalidate: [inboxListKey], queuedMessage: markReadQueuedMessage }
  );

  const items = inboxQuery.data ?? [];
  const unreadCount = items.filter((item) => !item.read_at).length;

  return {
    items,
    unreadCount,
    loading: inboxQuery.isInitialLoading,
    refreshing: inboxQuery.isRefreshing,
    error: inboxQuery.error,
    retry: inboxQuery.refetch,
    markingAllRead: markReadMutation.loading,
    openItem: (item: IInboxItem) => {
      if (!item.read_at) void markReadMutation.mutate([item.id]);
      navigate(item.url);
    },
    markAllRead: () => void markReadMutation.mutate(null),
  };
};
