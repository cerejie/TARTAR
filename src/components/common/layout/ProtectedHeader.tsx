import { Separator } from "@/components/ui/separator";
import {
  headerActions,
  headerBrand,
  headerDivider,
  headerLogoGlyph,
  headerLogoMark,
  headerRoot,
  headerWordmark,
} from "../../../styles/layout/header.styles";
import InboxBell from "../../inbox/menus/InboxBell";
import SyncIndicator from "../status/SyncIndicator";
import BrandMark from "./BrandMark";
import BrandWordmark from "./BrandWordmark";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";
import SidebarToggle from "./SidebarToggle";

const ProtectedHeader = () => (
  <header className={headerRoot}>
    <SidebarToggle />
    <div className={headerBrand}>
      <span className={headerLogoMark} aria-hidden="true">
        <BrandMark className={headerLogoGlyph} />
      </span>
      <BrandWordmark className={headerWordmark} />
    </div>

    <ProtectedBranchScope />

    <div className={headerActions}>
      <InboxBell />
      <SyncIndicator />
      <Separator orientation="vertical" className={headerDivider} />
      <ProtectedUserMenu />
    </div>
  </header>
);

export default ProtectedHeader;
