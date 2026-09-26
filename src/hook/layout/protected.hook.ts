import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hook/use-mobile";
import { effectiveRoleLabels } from "../../enums/role.enum";
import { dashboardAlertsKey, scopedKey } from "../../keys/query.keys";
import { dueAlertCount } from "../../models/data/dashboard/dashboard.response";
import { protectedViewsRoutes } from "../../routes/protected.view.routes";
import dashboardServices from "../../services/data/dashboard.services";
import { useNetworkStore } from "../../store/common/network.store";
import {
  selectThemeMode,
  useThemeStore,
} from "../../store/common/theme.store";
import { useAccountStore } from "../../store/data/account/account.store";
import {
  filterRoutesByPermission,
  navigableRoutes,
  pinnedRouteGroup,
  routeGroups,
} from "../../utils/route.utils";
import { usePermissions } from "../account/account.permission.hook";
import { useAccountLogoutHook } from "../account/account.logout.hook";
import { useNetwork } from "../common/network.hook";
import { useQuery } from "../common/query.hook";
import { useBranchScopeHook } from "../data/branch/branch.scope.hook";
import type { IDueAlerts } from "../../models/data/dashboard/dashboard.response";

export const useProtectedLayoutHook = () => {
  useNetwork();
};

export const useProtectedMenuHook = (pinned: boolean) => {
  const location = useLocation();
  const permissions = usePermissions();

  const groups = useMemo(() => {
    const allowed = navigableRoutes(
      filterRoutesByPermission(protectedViewsRoutes, permissions)
    );

    return routeGroups(allowed)
      .filter((group) => (group === pinnedRouteGroup) === pinned)
      .map((group) => ({
        label: group,
        routes: allowed.filter((route) => route.group === group),
      }));
  }, [permissions.role, pinned]);

  return { groups, activePath: location.pathname };
};

export const useProtectedHeaderHook = () => {
  const isMobile = useIsMobile();
  const permissions = usePermissions();

  return { showNotifications: isMobile && permissions.viewDashboard };
};

export const useProtectedNotificationsHook = () => {
  const { branch } = useBranchScopeHook();
  const alertsQuery = useQuery<IDueAlerts>(
    scopedKey(dashboardAlertsKey, branch),
    () => dashboardServices.getDueAlerts(7, branch)
  );

  return {
    alerts: alertsQuery.data,
    alertsLoading: alertsQuery.loading,
    alertCount: alertsQuery.data ? dueAlertCount(alertsQuery.data) : 0,
  };
};

export const useProtectedTitleHook = () => {
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

  return { title: matched?.label ?? "" };
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
