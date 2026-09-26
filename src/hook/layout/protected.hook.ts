import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { effectiveRoleLabels } from "../../enums/role.enum";
import { protectedViewsRoutes } from "../../routes/protected.view.routes";
import { useNetworkStore } from "../../store/common/network.store";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";
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
  const location = useLocation();
  const permissions = usePermissions();

  const groups = useMemo(() => {
    const allowed = navigableRoutes(
      filterRoutesByPermission(protectedViewsRoutes, permissions)
    );

    return routeGroups(allowed).map((group) => ({
      label: group,
      routes: allowed.filter((route) => route.group === group),
    }));
  }, [permissions.role]);

  return { groups, activePath: location.pathname };
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
  const mode = useThemeStore(selectThemeMode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  const displayName = user?.full_name || user?.username || "superAdmin";

  const roleLabel = permissions.role
    ? effectiveRoleLabels[permissions.role]
    : "";

  return {
    displayName,
    roleLabel,
    initial: displayName.trim().charAt(0).toUpperCase(),
    online,
    isDark: mode === "dark",
    toggleMode,
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
