import { supabase } from "../../utils/supabase.utils";

const transactionChannelName = "transactions-live";

const realtimeServices = {
  subscribeTransactions: (onChange: () => void): (() => void) => {
    const channel = supabase
      .channel(transactionChannelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        onChange
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export default realtimeServices;
