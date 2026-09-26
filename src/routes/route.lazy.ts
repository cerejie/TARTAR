import type { ComponentType } from "react";
import RouteErrorView from "../components/common/status/RouteErrorView";
import PageSkeleton from "../components/common/view/PageSkeleton";
import type { IRoute } from "../models/common/route.model";

type IViewModule = { default: ComponentType };

export const lazyView = (
  load: () => Promise<IViewModule>
): Pick<IRoute, "lazy" | "preload" | "HydrateFallback" | "ErrorBoundary"> => ({
  lazy: async () => ({ Component: (await load()).default }),
  preload: () => load().catch(() => undefined),
  HydrateFallback: PageSkeleton,
  ErrorBoundary: RouteErrorView,
});
