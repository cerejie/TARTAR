import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { shellSidebar } from "../../../styles/layout/shell.styles";
import {
  sidebarContent,
  sidebarFooter,
} from "../../../styles/layout/sidebar.styles";
import ProtectedMenu from "./ProtectedMenu";

const ProtectedSider = () => (
  <Sidebar collapsible="icon" className={shellSidebar}>
    <SidebarContent className={sidebarContent}>
      <ProtectedMenu />
    </SidebarContent>

    <SidebarFooter className={sidebarFooter}>
      <ProtectedMenu pinned />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
);

export default ProtectedSider;
