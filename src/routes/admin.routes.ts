import RouteRoot from "../components/common/layout/RouteRoot";
import RootErrorView from "../components/common/status/RootErrorView";
import AdminAppLayout from "../layouts/AdminAppLayout";
import type { IRoute } from "../models/common/route.model";
import { adminViewRoutes } from "./admin.view.routes";
import { permissionLoader } from "./route.guard";

export const adminLayoutRoutes: IRoute[] = [
  {
    id: "admin_root",
    Component: RouteRoot,
    ErrorBoundary: RootErrorView,
    children: [
      {
        id: "admin_route",
        Component: AdminAppLayout,
        loader: permissionLoader("viewDashboard", "/"),
        children: adminViewRoutes,
      },
    ],
  },
];
