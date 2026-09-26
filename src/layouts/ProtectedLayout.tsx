import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ProtectedHeader from "../components/common/layout/ProtectedHeader";
import ProtectedSider from "../components/common/layout/ProtectedSider";
import { useProtectedLayoutHook } from "../hook/layout/protected.hook";
import {
  shellBody,
  shellContent,
  shellInset,
  shellRoot,
} from "../styles/layout/shell.styles";

const ProtectedLayout = () => {
  useProtectedLayoutHook();

  return (
    <SidebarProvider className={shellRoot}>
      <ProtectedHeader />

      <div className={shellBody}>
        <ProtectedSider />

        <SidebarInset className={shellInset}>
          <div id="main-content" className={shellContent}>
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
