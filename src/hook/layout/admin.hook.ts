import { useLayoutEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hook/use-mobile";
import { adminBranchSheetModalKey } from "../../keys/modal.keys";
import { adminViewRoutes } from "../../routes/admin.view.routes";
import {
  selectScrollPosition,
  useScrollStore,
} from "../../store/common/scroll.store";
import {
  adminBasePath,
  adminNotificationsPath,
  filterRoutesByPermission,
  navigableRoutes,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useModal } from "../common/modal.hook";
import { useNetwork } from "../common/network.hook";
import { useAdminNotificationCountHook } from "../data/admin/admin.notifications.hook";
import { useAdminManifestHook } from "./admin.manifest.hook";

import type { UIEvent } from "react";

const isActiveAdminPath = (pathname: string, path: string): boolean =>
  path === adminBasePath
    ? pathname === path
    : pathname === path || pathname.startsWith(`${path}/`);

export const useAdminLayoutHook = () => {
  useNetwork();
  useAdminManifestHook();

  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLElement>(null);
  const setPosition = useScrollStore((state) => state.setPosition);

  useLayoutEffect(() => {
    const top = selectScrollPosition(pathname)(useScrollStore.getState());
    scrollRef.current?.scrollTo({ top });
  }, [pathname]);

  const handleScroll = (event: UIEvent<HTMLElement>) =>
    setPosition(pathname, event.currentTarget.scrollTop);

  return { pathname, scrollRef, handleScroll };
};

export const useAdminTabBarHook = () => {
  const { pathname } = useLocation();
  const permissions = usePermissions();

  const tabs = useMemo(
    () => navigableRoutes(filterRoutesByPermission(adminViewRoutes, permissions)),
    [permissions.role]
  );

  const { unreadCount } = useAdminNotificationCountHook();

  const isActive = (path: string) => isActiveAdminPath(pathname, path);
  const badgeOf = (path: string) => (path === adminNotificationsPath ? unreadCount : 0);

  return { tabs, isActive, badgeOf };
};

export const useAdminTitleHook = () => {
  const { pathname } = useLocation();

  const matched = adminViewRoutes.find(
    (route) => route.path && isActiveAdminPath(pathname, route.path)
  );

  return { title: matched?.label ?? "" };
};

export const useAdminBranchSheetHook = () => {
  const isMobile = useIsMobile();
  const { modal, openModal, closeModal } = useModal(adminBranchSheetModalKey);

  return {
    showSheet: isMobile,
    sheetOpen: modal.visible,
    openSheet: () => openModal(),
    closeSheet: closeModal,
  };
};
