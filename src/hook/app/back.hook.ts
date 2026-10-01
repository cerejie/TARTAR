import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { confirmOverlayKey } from "../../keys/modal.keys";
import { useConfirmStore } from "../../store/common/confirm.store";
import { useModalStore } from "../../store/common/modal.store";

type OverlayMarker = "open" | "spent";

const overlayMarkerField = "tartarOverlay";

const currentHistoryState = (): Record<string, unknown> => {
  const state: unknown = window.history.state;
  return typeof state === "object" && state !== null ? { ...state } : {};
};

const readOverlayMarker = (): OverlayMarker | undefined => {
  const marker = currentHistoryState()[overlayMarkerField];
  return marker === "open" || marker === "spent" ? marker : undefined;
};

const writeOverlayMarker = (marker: OverlayMarker, push: boolean) => {
  const state = { ...currentHistoryState(), [overlayMarkerField]: marker };

  if (push) {
    window.history.pushState(state, "");
    return;
  }

  window.history.replaceState(state, "");
};

const visibleOverlayKeys = (): string[] => {
  const modalKeys = Object.entries(useModalStore.getState().modals)
    .filter(([, modal]) => modal.visible)
    .map(([key]) => key);

  return useConfirmStore.getState().confirm.visible
    ? [...modalKeys, confirmOverlayKey]
    : modalKeys;
};

const isOverlayBusy = (key: string): boolean =>
  key === confirmOverlayKey && useConfirmStore.getState().running;

const closeOverlay = (key: string) => {
  if (key === confirmOverlayKey) {
    useConfirmStore.getState().closeConfirm();
    return;
  }

  useModalStore.getState().setModal(key, { visible: false });
};

export const useOverlayBackHook = () => {
  const { key: locationKey } = useLocation();
  const openOrder = useRef<string[]>([]);
  const lastMarker = useRef<OverlayMarker | undefined>(undefined);
  const skipping = useRef(false);

  const markOpen = () => {
    if (openOrder.current.length === 0) return;

    const marker = readOverlayMarker();
    if (marker === "open") return;

    writeOverlayMarker("open", marker !== "spent");
    lastMarker.current = "open";
  };

  const skipBack = () => {
    skipping.current = true;
    window.history.back();
  };

  useEffect(() => {
    const syncOverlays = () => {
      const visible = visibleOverlayKeys();
      const wasOpen = openOrder.current.length > 0;

      openOrder.current = [
        ...openOrder.current.filter((key) => visible.includes(key)),
        ...visible.filter((key) => !openOrder.current.includes(key)),
      ];

      if (openOrder.current.length > 0) {
        markOpen();
        return;
      }

      if (!wasOpen || readOverlayMarker() !== "open") return;

      writeOverlayMarker("spent", false);
      lastMarker.current = "spent";
    };

    const handlePopState = () => {
      const leftMarker = lastMarker.current;
      const landedMarker = readOverlayMarker();
      lastMarker.current = landedMarker;

      if (skipping.current) {
        skipping.current = false;

        if (openOrder.current.length === 0) {
          if (landedMarker) skipBack();
          return;
        }
      }

      const topKey = openOrder.current.at(-1);

      if (topKey) {
        if (isOverlayBusy(topKey)) {
          markOpen();
          return;
        }

        closeOverlay(topKey);
        return;
      }

      if (landedMarker || leftMarker === "spent") skipBack();
    };

    syncOverlays();
    const unsubscribeModals = useModalStore.subscribe(syncOverlays);
    const unsubscribeConfirm = useConfirmStore.subscribe(syncOverlays);
    window.addEventListener("popstate", handlePopState);

    return () => {
      unsubscribeModals();
      unsubscribeConfirm();
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    lastMarker.current = readOverlayMarker();
    markOpen();
  }, [locationKey]);
};
