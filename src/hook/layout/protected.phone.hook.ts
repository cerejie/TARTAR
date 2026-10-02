import { useEffect } from "react";
import { alertsSheetModalKey } from "../../keys/modal.keys";
import { useModal } from "../common/modal.hook";
import { usePullToRefresh } from "../common/pull.hook";
import { useScrollRestore } from "../common/scroll.hook";
import { useSearchMode } from "../common/search.hook";
import { useNotificationCenterHook, useProtectedTitleHook } from "./protected.hook";

export const usePhoneShellHook = () => {
  const { pathname, scrollRef, handleScroll } = useScrollRestore();
  const pullHandlers = usePullToRefresh();
  const { title } = useProtectedTitleHook();
  const { openModal } = useModal(alertsSheetModalKey);
  const { activeSearchMode, closeSearchMode } = useSearchMode();

  useEffect(() => closeSearchMode, [pathname, closeSearchMode]);

  return {
    pathname,
    searchMode: activeSearchMode,
    scrollRef,
    handleScroll,
    pullHandlers,
    title,
    openAlerts: () => openModal(),
  };
};

export const useAlertsSheetHook = () => {
  const { modal, closeModal } = useModal(alertsSheetModalKey);
  const { showAlerts } = useNotificationCenterHook();

  return {
    open: modal.visible,
    close: closeModal,
    title: showAlerts ? "Notifications & Alerts" : "Notifications",
  };
};
