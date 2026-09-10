import { createElement, useMemo } from "react";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { effectiveRoleLabels } from "../../enums/role.enum";
import { protectedViewsRoutes } from "../../routes/protected.view.routes";
import { useNetworkStore } from "../../store/common/network.store";
import { useAccountStore } from "../../store/data/account/account.store";
import {
  filterRoutesByPermission,
  navigableRoutes,
  routeGroups,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useAccountLogoutHook } from "../account/account.logout.hook";
import { useNetwork } from "../common/network.hook";
import { useBranchScopeHook } from "../data/branch/branch.scope.hook";

export const useProtectedLayoutHook = () => {
  useNetwork();
};

export const useProtectedMenuHook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions();

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
          icon: route.icon ? createElement(route.icon) : undefined,
        }));

      return children.length
        ? [{ type: "group" as const, key: group, label: group, children }]
        : [];
    });
  }, [permissions.role]);

  return {
    items,
    selectedKey: location.pathname,
    onSelect: (key: string) => navigate(key),
  };
};

export const useProtectedHeaderHook = () => {
  const location = useLocation();

  const matched = useMemo(
    () =>
      protectedViewsRoutes
        .filter((route) => route.path && route.label)
        .sort((a, b) => (b.path as string).length - (a.path as string).length)
        .find(
          (route) =>
            location.pathname === route.path ||
            location.pathname.startsWith(`${route.path}/`)
        ),
    [location.pathname]
  );

  return {
    title: matched?.label ?? "",
    description: matched?.description ?? "",
  };
};

export const useProtectedUserHook = () => {
  const user = useAccountStore((state) => state.user);
  const online = useNetworkStore((state) => state.online);
  const permissions = usePermissions();
  const { logoutMutation } = useAccountLogoutHook();

  const displayName = user?.full_name || user?.username || "superAdmin";

  const roleLabel = permissions.role
    ? effectiveRoleLabels[permissions.role]
    : "";

  return {
    displayName,
    roleLabel,
    initial: displayName.trim().charAt(0).toUpperCase(),
    online,
    logoutMutation,
  };
};

export const useProtectedFooterHook = () => {
  const online = useNetworkStore((state) => state.online);
  const { branchName } = useBranchScopeHook();

  return {
    year: new Date().getFullYear(),
    branchLabel: branchName ? `Branch: ${branchName}` : "All branches",
    online,
  };
};
