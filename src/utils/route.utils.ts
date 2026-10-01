import type { EffectiveRole } from "../enums/role.enum";
import type { IPermissions } from "../models/common/permission.model";
import type { IRoute } from "../models/common/route.model";

export const pinnedRouteGroup = "System";

export const filterRoutesByPermission = (
  routes: IRoute[],
  permissions: IPermissions
): IRoute[] =>
  routes
    .filter((route) => !route.can || permissions[route.can])
    .map((route) =>
      route.children
        ? {
            ...route,
            children: filterRoutesByPermission(route.children, permissions),
          }
        : { ...route }
    );

export const navigableRoutes = (routes: IRoute[]): IRoute[] =>
  routes.filter((route) => !!route.label && !!route.icon && !route.isNotNav);

export const routeGroups = (routes: IRoute[]): string[] => {
  const groups: string[] = [];

  for (const route of routes) {
    if (route.group && !groups.includes(route.group)) groups.push(route.group);
  }

  return groups;
};

export const resetLocation = (pathname: string): void => {
  window.history.replaceState(null, "", pathname);
};

export const adminBasePath = "/admin";
export const adminPayablesPath = `${adminBasePath}/payables`;
export const adminReceivablesPath = `${adminBasePath}/receivables`;
export const adminNotificationsPath = `${adminBasePath}/notifications`;

export const dashboardPath = "/";
export const vouchersPath = "/vouchers";
export const payablesPath = "/payables";
export const receivablesPath = "/receivables";

const managerPhoneTabPaths = [dashboardPath, "/transactions", vouchersPath] as const;

const phoneTabPathsByRole: Record<EffectiveRole, readonly string[]> = {
  developer: managerPhoneTabPaths,
  superadmin: managerPhoneTabPaths,
  admin: managerPhoneTabPaths,
  accountant: ["/transactions", receivablesPath, payablesPath, "/reports"],
  employee: ["/sales", "/expenses", vouchersPath, receivablesPath],
};

const phoneTabLabels: Record<string, string> = {
  [dashboardPath]: "Home",
};

export const phoneTabPathsOf = (role: EffectiveRole | null): readonly string[] =>
  role ? phoneTabPathsByRole[role] : [];

export const phoneTabLabelOf = (path: string, label: string): string =>
  phoneTabLabels[path] ?? label;

export const isActiveRoutePath = (pathname: string, path: string): boolean =>
  path === dashboardPath
    ? pathname === path
    : pathname === path || pathname.startsWith(`${path}/`);

export const isAdminPath = (pathname: string): boolean =>
  pathname === adminBasePath || pathname.startsWith(`${adminBasePath}/`);
