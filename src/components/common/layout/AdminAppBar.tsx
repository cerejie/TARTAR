import { useAdminTitleHook } from "../../../hook/layout/admin.hook";
import {
  adminAppBar,
  adminAppBarActions,
  adminAppBarTitle,
} from "../../../styles/admin/admin.layout.styles";
import SyncIndicator from "../status/SyncIndicator";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";

const AdminAppBar = () => {
  const { title } = useAdminTitleHook();

  return (
    <header className={adminAppBar}>
      <h1 className={adminAppBarTitle}>{title}</h1>
      <ProtectedBranchScope />
      <div className={adminAppBarActions}>
        <SyncIndicator />
        <ProtectedUserMenu />
      </div>
    </header>
  );
};

export default AdminAppBar;
