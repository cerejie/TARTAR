import type { IPermissions } from "../models/common/permission.model";
import type { IRoute } from "../models/common/route.model";

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
