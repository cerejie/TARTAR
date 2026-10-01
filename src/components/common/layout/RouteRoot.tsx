import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router-dom";
import { useOverlayBackHook } from "../../../hook/app/back.hook";

const RouteRoot = () => {
  const navigate = useNavigate();
  useOverlayBackHook();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
