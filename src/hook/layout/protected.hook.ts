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
import { useBranchScopeHook } from "../data/branch/branch.scope.hook";

type ICallout = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

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

export const useProtectedHeaderUserHook = () => {
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

export const useProtectedCalloutHook = (): ICallout | null => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  if (permissions.approveVouchers)
    return {
      title: "Voucher approvals",
      description: "Review the vouchers waiting on your sign-off.",
      actionLabel: "Open vouchers",
      onAction: () => navigate("/vouchers"),
    };

  if (permissions.viewIncomeExpenses)
    return {
      title: "Period reporting",
      description: "Cash flow, ledger and expense summaries in one place.",
      actionLabel: "Open reports",
      onAction: () => navigate("/reports"),
    };

  return null;
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
