import RouteRoot from "../components/common/layout/RouteRoot";
import RootErrorView from "../components/common/status/RootErrorView";
import type { IRoute } from "../models/common/route.model";
import { adminViewRoutes } from "./admin.view.routes";
import { permissionLoader } from "./route.guard";
import { lazyView } from "./route.lazy";

export const adminLayoutRoutes: IRoute[] = [
  {
    id: "admin_root",
    Component: RouteRoot,
    ErrorBoundary: RootErrorView,
    children: [
      {
        id: "admin_route",
        ...lazyView(() => import("../layouts/AdminAppLayout")),
        loader: permissionLoader("viewDashboard", "/"),
        children: adminViewRoutes,
      },
    ],
  },
];
