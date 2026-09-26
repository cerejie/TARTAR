import { Separator } from "@/components/ui/separator";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  headerActions,
  headerBrand,
  headerDivider,
  headerLogoMark,
  headerRoot,
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
