import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

import type { IMutationResult } from "../../models/common/query.model";
import type { IInboxItem } from "../../models/data/inbox/inbox.response";

const table = "notifications";
const columns = "id, title, body, url, tag, created_at, read_at";
const inboxLimit = 50;

const inboxServices = {
  getList: async (): Promise<IInboxItem[]> => {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(inboxLimit);
    if (error) throw toError(error);
    return data ?? [];
  },

  markRead: (ids: readonly string[] | null): Promise<IMutationResult> =>
    runWrite({
      label: ids ? "Mark notification read" : "Mark all notifications read",
      kind: "rpc",
      fn: "mark_notifications_read",
      args: { p_ids: ids },
    }),
};

export default inboxServices;
