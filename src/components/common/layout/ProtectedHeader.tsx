import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  headerActions,
  headerBrand,
  headerDivider,
  headerLogoMark,
  headerRoot,
  headerTrigger,
  headerWordmark,
} from "../../../styles/layout/header.styles";
import SyncIndicator from "../status/SyncIndicator";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedNotifications from "./ProtectedNotifications";
import ProtectedUserMenu from "./ProtectedUserMenu";

const ProtectedHeader = () => {
  const { showNotifications } = useProtectedHeaderHook();

  return (
    <header className={headerRoot}>
      <SidebarTrigger variant="outline" size="icon" className={headerTrigger} />
      <div className={headerBrand}>
        <span className={headerLogoMark} aria-hidden="true">
          T
        </span>
        <span className={headerWordmark}>TARTAR</span>
      </div>

      <ProtectedBranchScope />

      <div className={headerActions}>
        {showNotifications ? <ProtectedNotifications /> : null}
        <SyncIndicator />
        <Separator orientation="vertical" className={headerDivider} />
        <ProtectedUserMenu />
      </div>
    </header>
  );
};

export default ProtectedHeader;
