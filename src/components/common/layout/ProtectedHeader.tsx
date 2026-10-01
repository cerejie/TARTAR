import { Separator } from "@/components/ui/separator";
import {
  headerActions,
  headerBrand,
  headerDivider,
  headerLogoMark,
  headerRoot,
  headerWordmark,
} from "../../../styles/layout/header.styles";
import InboxBell from "../../inbox/menus/InboxBell";
import SyncIndicator from "../status/SyncIndicator";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";

const ProtectedHeader = () => (
  <header className={headerRoot}>
    <div className={headerBrand}>
      <span className={headerLogoMark} aria-hidden="true">
        T
      </span>
      <span className={headerWordmark}>TARTAR</span>
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
