import type { IPushSubscriptionInput } from "../../models/common/push.model";
import { onlineOnly, supabase, toError } from "../../utils/supabase.utils";

const pushServices = {
  save: async (input: IPushSubscriptionInput): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("save_push_subscription", {
        p_endpoint: input.endpoint,
        p_p256dh: input.p256dh,
        p_auth: input.auth,
        p_user_agent: input.userAgent,
      })
    );
    if (error) throw toError(error);
  },

  remove: async (endpoint: string): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("delete_push_subscription", { p_endpoint: endpoint })
    );
    if (error) throw toError(error);
  },
};

export default pushServices;
