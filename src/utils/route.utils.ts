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

export const vouchersPath = "/vouchers";
export const payablesPath = "/payables";
export const receivablesPath = "/receivables";

export const isAdminPath = (pathname: string): boolean =>
  pathname === adminBasePath || pathname.startsWith(`${adminBasePath}/`);
