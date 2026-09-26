import RouteRoot from "../components/common/layout/RouteRoot";
import ProtectedLayout from "../layouts/ProtectedLayout";
import type { IRoute } from "../models/common/route.model";
import { protectedViewsRoutes } from "./protected.view.routes";

export const protectedLayoutRoutes: IRoute[] = [
  {
    id: "protected_root",
    Component: RouteRoot,
    children: [
      {
        id: "protected_route",
        Component: ProtectedLayout,
        children: protectedViewsRoutes,
      },
    ],
  },
];
