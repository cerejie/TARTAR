import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useProtectedSiderHook } from "../../../hook/layout/protected.hook";
import { shellSidebar } from "../../../styles/layout/shell.styles";
import {
  sidebarContent,
  sidebarFooter,
} from "../../../styles/layout/sidebar.styles";
import ProtectedMenu from "./ProtectedMenu";

const ProtectedSider = () => {
  const { collapsible } = useProtectedSiderHook();

  return (
    <Sidebar collapsible={collapsible} className={shellSidebar}>
      <SidebarContent className={sidebarContent}>
        <ProtectedMenu />
      </SidebarContent>

      <SidebarFooter className={sidebarFooter}>
        <ProtectedMenu pinned />
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProtectedSider;
