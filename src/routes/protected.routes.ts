import RouteRoot from "../components/common/layout/RouteRoot";
import RootErrorView from "../components/common/status/RootErrorView";
import type { IRoute } from "../models/common/route.model";
import { protectedViewsRoutes } from "./protected.view.routes";
import { lazyView } from "./route.lazy";

export const protectedLayoutRoutes: IRoute[] = [
  {
    id: "protected_root",
    Component: RouteRoot,
    ErrorBoundary: RootErrorView,
    children: [
      {
        id: "protected_route",
        ...lazyView(() => import("../layouts/ProtectedLayout")),
        children: protectedViewsRoutes,
      },
    ],
  },
];
