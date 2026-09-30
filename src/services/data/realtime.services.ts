import { supabase } from "../../utils/supabase.utils";

const liveChannelName = "ledger-live";

const liveTables: readonly string[] = ["transactions", "receivables", "payables"];

const realtimeServices = {
  subscribeLedgerChanges: (onChange: () => void): (() => void) => {
    const channel = liveTables.reduce(
      (subscribed, table) =>
        subscribed.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          onChange
        ),
      supabase.channel(liveChannelName)
    );
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

export default realtimeServices;
