import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hook/use-mobile";
import { useOverlayBackHook } from "../../../hook/app/back.hook";

const RouteRoot = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  useOverlayBackHook();

  const navigateTo = (path: string) => navigate(path, { viewTransition: isMobile });

  return (
    <RouterProvider navigate={navigateTo} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
