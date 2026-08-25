import { useEffect } from "react";
import { useNetworkStore } from "../../store/common/network.store";
import { useSyncStore } from "../../store/common/sync.store";

export const useNetwork = () => {
  const setOnline = useNetworkStore((state) => state.setOnline);
  const flush = useSyncStore((state) => state.flush);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      void flush();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if (navigator.onLine) void flush();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline, flush]);
};

export const useSyncStatus = () => {
  const online = useNetworkStore((state) => state.online);
  const pending = useSyncStore((state) => state.queue.length);
  const flushing = useSyncStore((state) => state.flushing);

  return { online, pending, flushing };
};
