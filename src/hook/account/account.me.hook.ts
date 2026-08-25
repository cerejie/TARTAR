import { useMemo } from "react";
import { createBrowserRouter } from "react-router-dom";
import type { IRoute } from "../../models/common/route.model";
import ErrorView from "../../pages/Error/ErrorView";
import { protectedLayoutRoutes } from "../../routes/protected.routes";
import { publicLayoutRoutes } from "../../routes/public.routes";
import { useAccountStore } from "../../store/data/account/account.store";

const notFoundRoute: IRoute = {
  path: "*",
  label: "Error",
  Component: ErrorView,
};

export const useAccountMeHook = () => {
  const kind = useAccountStore((state) => state.kind);
  const user = useAccountStore((state) => state.user);

  const router = useMemo(() => {
    const layoutRoutes = kind ? protectedLayoutRoutes : publicLayoutRoutes;
    return createBrowserRouter([...layoutRoutes, notFoundRoute]);
  }, [kind]);

  return { kind, user, routes: router };
};
