import PublicLayout from "../layouts/PublicLayout";
import type { IRoute } from "../models/common/route.model";
import { publicViewsRoutes } from "./public.view.routes";

export const publicLayoutRoutes: IRoute[] = [
  {
    id: "public_route",
    Component: PublicLayout,
    children: publicViewsRoutes,
  },
];
