import { RouterProvider } from "react-aria-components";
import { Outlet, useHref, useNavigate } from "react-router-dom";

const RouteRoot = () => {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
};

export default RouteRoot;
