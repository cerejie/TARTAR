import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router-dom";
import { useOverlayBackHook } from "../../../hook/app/back.hook";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";

const RouteRoot = () => {
  const navigate = useNavigate();
  const isCompact = useIsCompact();
  useOverlayBackHook();

  const navigateTo = (path: string) => navigate(path, { viewTransition: isCompact });

  return (
    <RouterProvider navigate={navigateTo} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
