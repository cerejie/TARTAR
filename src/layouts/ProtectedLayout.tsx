import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ProtectedFooter from "../components/common/layout/ProtectedFooter";
import ProtectedHeader from "../components/common/layout/ProtectedHeader";
import ProtectedSider from "../components/common/layout/ProtectedSider";
import { useProtectedLayoutHook } from "../hook/layout/protected.hook";
import {
  shellContent,
  shellInset,
  shellRoot,
} from "../styles/layout/shell.styles";

const ProtectedLayout = () => {
  useProtectedLayoutHook();

  return (
    <SidebarProvider className={shellRoot}>
      <ProtectedSider />

      <SidebarInset className={shellInset}>
        <ProtectedHeader />
        <div id="main-content" className={shellContent}>
          <Outlet />
        </div>
        <ProtectedFooter />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
