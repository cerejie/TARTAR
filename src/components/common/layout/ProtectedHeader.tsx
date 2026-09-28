import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProtectedHeaderHook } from "../../../hook/layout/protected.hook";
import {
  headerActions,
  headerBrand,
  headerDivider,
  headerLogoMark,
  headerMenuButton,
  headerRoot,
  headerWordmark,
} from "../../../styles/layout/header.styles";
import SyncIndicator from "../status/SyncIndicator";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedNotifications from "./ProtectedNotifications";
import ProtectedUserMenu from "./ProtectedUserMenu";

const ProtectedHeader = () => {
  const { showMenuButton, showNotifications, toggleMenu } =
    useProtectedHeaderHook();

  return (
    <header className={headerRoot}>
      {showMenuButton ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className={headerMenuButton}
          onPress={toggleMenu}
        >
          <Menu aria-hidden="true" />
        </Button>
      ) : null}

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
