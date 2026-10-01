import { useEffect } from "react";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

const updateToastId = "app-update";
const updateCheckIntervalMs = 60 * 60 * 1000;

const reloadIntoUpdate = (updateServiceWorker: (reloadPage?: boolean) => Promise<void>) => {
  if (!navigator.serviceWorker.controller) {
    window.location.reload();
    return;
  }

  void updateServiceWorker(true);
};

export const useAppUpdateHook = () => {
  useEffect(() => {
    const listeners = new AbortController();
    let checkInterval: number | undefined;

    const updateServiceWorker = registerSW({
      onNeedRefresh: () =>
        toast("A new version of TARTAR is ready", {
          id: updateToastId,
          description: "Reload to update. Changes waiting to sync are kept.",
          duration: Infinity,
          action: {
            label: "Reload",
            onClick: () => reloadIntoUpdate(updateServiceWorker),
          },
        }),
      onRegisteredSW: (_swUrl, registration) => {
        if (!registration || listeners.signal.aborted) return;

        const checkForUpdate = () => {
          if (navigator.onLine) void registration.update();
        };

        checkInterval = window.setInterval(checkForUpdate, updateCheckIntervalMs);
        document.addEventListener(
          "visibilitychange",
          () => {
            if (document.visibilityState === "visible") checkForUpdate();
          },
          { signal: listeners.signal }
        );
      },
    });

    return () => {
      listeners.abort();
      window.clearInterval(checkInterval);
    };
  }, []);
};
