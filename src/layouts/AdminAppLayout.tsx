import { Outlet } from "react-router-dom";
import AdminAppBar from "../components/common/layout/AdminAppBar";
import AdminTabBar from "../components/common/layout/AdminTabBar";
import PullIndicator from "../components/common/app/PullIndicator";
import RouteProgress from "../components/common/layout/RouteProgress";
import { useAdminLayoutHook } from "../hook/layout/admin.hook";
import {
  adminColumn,
  adminContent,
  adminMain,
  adminShell,
} from "../styles/admin/admin.layout.styles";

const AdminAppLayout = () => {
  const { pathname, scrollRef, handleScroll, pullHandlers } = useAdminLayoutHook();

  return (
    <div className={adminShell}>
      <RouteProgress />
      <AdminTabBar />

      <div className={adminMain}>
        <AdminAppBar />

        <main
          id="main-content"
          ref={scrollRef}
          onScroll={handleScroll}
          className={adminContent}
          {...pullHandlers}
        >
          <PullIndicator />
          <div key={pathname} className={adminColumn}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAppLayout;
