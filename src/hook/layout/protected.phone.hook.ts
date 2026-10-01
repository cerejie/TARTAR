import { alertsSheetModalKey } from "../../keys/modal.keys";
import { usePermissions } from "../account/account.permission.hook";
import { useModal } from "../common/modal.hook";
import { usePullToRefresh } from "../common/pull.hook";
import { useScrollRestore } from "../common/scroll.hook";
import { useProtectedNotificationsHook, useProtectedTitleHook } from "./protected.hook";

export const usePhoneShellHook = () => {
  const { pathname, scrollRef, handleScroll } = useScrollRestore();
  const pullHandlers = usePullToRefresh();
  const { title } = useProtectedTitleHook();
  const { viewDashboard } = usePermissions();
  const { alertCount } = useProtectedNotificationsHook(viewDashboard);
  const { openModal } = useModal(alertsSheetModalKey);

  return {
    pathname,
    scrollRef,
    handleScroll,
    pullHandlers,
    title,
    dueCount: alertCount,
    openAlerts: () => openModal(),
  };
};

export const useAlertsSheetHook = () => {
  const { modal, closeModal } = useModal(alertsSheetModalKey);
  const { viewDashboard: showAlerts } = usePermissions();
  const { alerts, alertsLoading } = useProtectedNotificationsHook(showAlerts);

  return {
    open: modal.visible,
    close: closeModal,
    title: showAlerts ? "Notifications & Alerts" : "Notifications",
    showAlerts,
    alerts,
    alertsLoading,
  };
};
