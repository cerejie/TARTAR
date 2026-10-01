import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useProtectedSiderHook } from "../../../hook/layout/protected.hook";
import { headerLogoMark } from "../../../styles/layout/header.styles";
import { shellSidebar } from "../../../styles/layout/shell.styles";
import {
  sidebarAccount,
  sidebarContent,
  sidebarFooter,
  sidebarHeader,
  sidebarWordmark,
} from "../../../styles/layout/sidebar.styles";
import AccountSheetItems from "./AccountSheetItems";
import ProtectedMenu from "./ProtectedMenu";

type IProps = {
  account?: boolean;
};

const ProtectedSider = ({ account = false }: IProps) => {
  const { collapsible } = useProtectedSiderHook();

  return (
    <Sidebar collapsible={collapsible} className={shellSidebar}>
      <SidebarHeader className={sidebarHeader}>
        <span className={headerLogoMark} aria-hidden="true">
          T
        </span>
        <span className={sidebarWordmark}>TARTAR</span>
      </SidebarHeader>

      <SidebarContent className={sidebarContent}>
        <ProtectedMenu />
        {account ? (
          <>
            <ProtectedMenu pinned />
            <div className={sidebarAccount}>
              <AccountSheetItems />
            </div>
          </>
        ) : null}
      </SidebarContent>

      {account ? null : (
        <SidebarFooter className={sidebarFooter}>
          <ProtectedMenu pinned />
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default ProtectedSider;
