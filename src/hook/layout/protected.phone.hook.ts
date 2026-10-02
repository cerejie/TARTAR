import { alertsSheetModalKey } from "../../keys/modal.keys";
import { useModal } from "../common/modal.hook";
import { usePullToRefresh } from "../common/pull.hook";
import { useScrollRestore } from "../common/scroll.hook";
import { useNotificationCenterHook, useProtectedTitleHook } from "./protected.hook";

export const usePhoneShellHook = () => {
  const { pathname, scrollRef, handleScroll } = useScrollRestore();
  const pullHandlers = usePullToRefresh();
  const { title } = useProtectedTitleHook();
  const { openModal } = useModal(alertsSheetModalKey);

  return {
    pathname,
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
