import React, { useMemo } from "react";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { userRoleLabels } from "../../enums/role.enum";
import { protectedViewsRoutes } from "../../routes/protected.view.routes";
import { useNetworkStore } from "../../store/common/network.store";
import { useThemeStore } from "../../store/common/theme.store";
import { useAccountStore } from "../../store/data/account/account.store";
import {
  filterRoutesByPermission,
  navigableRoutes,
  routeGroups,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useAccountLogoutHook } from "../account/account.logout.hook";
import { useNetwork } from "../common/network.hook";

export const useProtectedLayoutHook = () => {
  useNetwork();

  const siderCollapsed = useThemeStore((state) => state.siderCollapsed);
  const siderBroken = useThemeStore((state) => state.siderBroken);
  const toggleSider = useThemeStore((state) => state.toggleSider);
  const setSiderCollapsed = useThemeStore((state) => state.setSiderCollapsed);
  const setSiderBroken = useThemeStore((state) => state.setSiderBroken);

  return {
    siderCollapsed,
    siderBroken,
    toggleSider,
    setSiderCollapsed,
    setSiderBroken,
  };
};

export const useProtectedMenuHook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions();
  const siderBroken = useThemeStore((state) => state.siderBroken);
  const setSiderCollapsed = useThemeStore((state) => state.setSiderCollapsed);

  const items: MenuProps["items"] = useMemo(() => {
    const allowed = navigableRoutes(
      filterRoutesByPermission(protectedViewsRoutes, permissions)
    );

    return routeGroups(allowed).flatMap((group) => {
      const children = allowed
        .filter((route) => route.group === group)
        .map((route) => ({
          key: route.path as string,
          label: route.label,
          icon: route.icon ? React.createElement(route.icon) : undefined,
        }));

      return children.length
        ? [{ type: "group" as const, key: group, label: group, children }]
        : [];
    });
  }, [permissions.role]);

  const onSelect = (key: string) => {
    navigate(key);
    if (siderBroken) setSiderCollapsed(true);
  };

  return { items, selectedKey: location.pathname, onSelect };
};

export const useProtectedSiderUserHook = () => {
  const user = useAccountStore((state) => state.user);
  const permissions = usePermissions();
  const online = useNetworkStore((state) => state.online);
  const { logoutMutation } = useAccountLogoutHook();

  const displayName =
    user?.full_name || user?.username || "superAdmin (Developer)";

  const roleLabel =
    permissions.role === "superadmin"
      ? "superAdmin"
      : permissions.role
        ? userRoleLabels[permissions.role]
        : "";

  return { displayName, roleLabel, online, logoutMutation };
};
