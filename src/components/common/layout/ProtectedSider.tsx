import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  sidebarContent,
  sidebarFooter,
  sidebarHeader,
  sidebarLogoMark,
  sidebarLogoSub,
  sidebarLogoText,
  sidebarLogoWord,
} from "../../../styles/layout/sidebar.styles";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedMenu from "./ProtectedMenu";
import ProtectedSiderUser from "./ProtectedSiderUser";

const ProtectedSider = () => (
  <Sidebar collapsible="icon">
    <SidebarHeader className={sidebarHeader}>
      <span className={sidebarLogoMark} aria-hidden="true">
        T
      </span>
      <span className={sidebarLogoText}>
        <span className={sidebarLogoWord}>TARTAR ERP</span>
        <span className={sidebarLogoSub}>Enterprise Suite</span>
      </span>
    </SidebarHeader>

    <ProtectedBranchScope />

    <SidebarContent className={sidebarContent}>
      <ProtectedMenu />
    </SidebarContent>

    <SidebarFooter className={sidebarFooter}>
      <ProtectedSiderUser />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
);

export default ProtectedSider;
