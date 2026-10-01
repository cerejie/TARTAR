import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Ellipsis } from "lucide-react";
import { alertsSheetModalKey, moreSheetModalKey } from "../../keys/modal.keys";
import { protectedViewsRoutes } from "../../routes/protected.view.routes";
import {
  dashboardPath,
  filterRoutesByPermission,
  isActiveRoutePath,
  navigableRoutes,
  phoneTabLabelOf,
  phoneTabPathsOf,
  routeGroups,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useModal } from "../common/modal.hook";
import { usePullToRefresh } from "../common/pull.hook";
import { useScrollRestore } from "../common/scroll.hook";
import { useProtectedNotificationsHook, useProtectedTitleHook } from "./protected.hook";

import type { IRoute } from "../../models/common/route.model";
import type { ITabItem } from "../../models/common/tab.model";

const isRoute = (route: IRoute | undefined): route is IRoute => route !== undefined;

const usePhoneRoutesHook = () => {
  const permissions = usePermissions();

  return useMemo(() => {
    const allowed = navigableRoutes(
      filterRoutesByPermission(protectedViewsRoutes, permissions)
    );
    const tabPaths = phoneTabPathsOf(permissions.role);

    return {
      tabRoutes: tabPaths
        .map((path) => allowed.find((route) => route.path === path))
        .filter(isRoute),
      moreRoutes: allowed.filter((route) => !tabPaths.includes(route.path ?? "")),
      showAlerts: permissions.viewDashboard,
    };
  }, [permissions.role]);
};

export const usePhoneShellHook = () => {
  const { pathname, scrollRef, handleScroll } = useScrollRestore();
  const pullHandlers = usePullToRefresh();
  const { title } = useProtectedTitleHook();

  return { pathname, scrollRef, handleScroll, pullHandlers, title };
};

export const usePhoneTabBarHook = () => {
  const { pathname } = useLocation();
  const { tabRoutes, showAlerts } = usePhoneRoutesHook();
  const moreSheet = useModal(moreSheetModalKey);
  const alertsSheet = useModal(alertsSheetModalKey);
  const { alertCount } = useProtectedNotificationsHook(showAlerts);

  const routeTabs: ITabItem[] = tabRoutes.map((route) => {
    const path = route.path ?? dashboardPath;

    return {
      key: path,
      label: phoneTabLabelOf(path, route.label ?? ""),
      icon: route.icon,
      href: path,
      active: isActiveRoutePath(pathname, path),
      badge: 0,
      preload: route.preload,
    };
  });

  const alertsTab: ITabItem = {
    key: alertsSheetModalKey,
    label: "Alerts",
    icon: Bell,
    onPress: () => alertsSheet.openModal(),
    active: alertsSheet.modal.visible,
    badge: alertCount,
  };

  const moreTab: ITabItem = {
    key: moreSheetModalKey,
    label: "More",
    icon: Ellipsis,
    onPress: () => moreSheet.openModal(),
    active: moreSheet.modal.visible || !routeTabs.some((tab) => tab.active),
    badge: 0,
  };

  return {
    tabs: [...routeTabs, ...(showAlerts ? [alertsTab] : []), moreTab],
    showAlerts,
  };
};

export const useMoreSheetHook = () => {
  const { pathname } = useLocation();
  const { moreRoutes } = usePhoneRoutesHook();
  const { modal, closeModal } = useModal(moreSheetModalKey);

  const groups = routeGroups(moreRoutes).map((group) => ({
    label: group,
    routes: moreRoutes.filter((route) => route.group === group),
  }));

  return {
    open: modal.visible,
    close: closeModal,
    groups,
    isActive: (path: string) => isActiveRoutePath(pathname, path),
  };
};

export const useAlertsSheetHook = () => {
  const { modal, closeModal } = useModal(alertsSheetModalKey);
  const { alerts, alertsLoading } = useProtectedNotificationsHook(true);

  return { open: modal.visible, close: closeModal, alerts, alertsLoading };
};
