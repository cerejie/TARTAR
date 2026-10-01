import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { adminUserSheetModalKey } from "../../keys/modal.keys";
import { adminViewRoutes } from "../../routes/admin.view.routes";
import {
  adminBasePath,
  adminNotificationsPath,
  filterRoutesByPermission,
  navigableRoutes,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { panelThemeColorToken, useThemeColorHook } from "../app/theme.color.hook";
import { useIsTabletUp } from "../common/breakpoint.hook";
import { useModal } from "../common/modal.hook";
import { useNetwork } from "../common/network.hook";
import { usePullToRefresh } from "../common/pull.hook";
import { useScrollRestore } from "../common/scroll.hook";
import { useAdminNotificationCountHook } from "../data/admin/admin.notifications.hook";
import { useAdminManifestHook } from "./admin.manifest.hook";

import type { ITabItem } from "../../models/common/tab.model";

const isActiveAdminPath = (pathname: string, path: string): boolean =>
  path === adminBasePath
    ? pathname === path
    : pathname === path || pathname.startsWith(`${path}/`);

export const useAdminLayoutHook = () => {
  useNetwork();
  useAdminManifestHook();
  useThemeColorHook(panelThemeColorToken);

  const { pathname, scrollRef, handleScroll } = useScrollRestore();
  const pullHandlers = usePullToRefresh();

  return { pathname, scrollRef, handleScroll, pullHandlers };
};

export const useAdminTabBarHook = () => {
  const { pathname } = useLocation();
  const permissions = usePermissions();

  const routes = useMemo(
    () => navigableRoutes(filterRoutesByPermission(adminViewRoutes, permissions)),
    [permissions.role]
  );

  const { unreadCount } = useAdminNotificationCountHook();

  const tabs: ITabItem[] = routes.map((route) => {
    const path = route.path ?? adminBasePath;

    return {
      key: path,
      label: route.label ?? "",
      icon: route.icon,
      href: path,
      active: isActiveAdminPath(pathname, path),
      badge: path === adminNotificationsPath ? unreadCount : 0,
      preload: route.preload,
    };
  });

  return { tabs };
};

export const useAdminTitleHook = () => {
  const { pathname } = useLocation();

  const matched = adminViewRoutes.find(
    (route) => route.path && isActiveAdminPath(pathname, route.path)
  );

  return { title: matched?.label ?? "" };
};

export const useAdminAppBarHook = () => {
  const isPhone = !useIsTabletUp();
  const { title } = useAdminTitleHook();

  return { title, showUserSheet: isPhone };
};

export const useAdminUserSheetHook = () => {
  const isPhone = !useIsTabletUp();
  const { modal, openModal, closeModal } = useModal(adminUserSheetModalKey);

  return {
    showSheet: isPhone,
    sheetOpen: modal.visible,
    openSheet: () => openModal(),
    closeSheet: closeModal,
  };
};
