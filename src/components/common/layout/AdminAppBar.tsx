import {
  useAdminAppBarHook,
  useAdminBranchSheetHook,
  useAdminUserSheetHook,
} from "../../../hook/layout/admin.hook";
import { branchSheetList } from "../../../styles/app/app.styles";
import {
  adminAppBar,
  adminAppBarActions,
  adminAppBarTitle,
} from "../../../styles/admin/admin.layout.styles";
import AppSheet from "../app/AppSheet";
import SyncIndicator from "../status/SyncIndicator";
import AdminUserSheet from "./AdminUserSheet";
import BranchScopeList from "./BranchScopeList";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";

const AdminAppBar = () => {
  const { scrolled, compact, title } = useAdminAppBarHook();
  const { showSheet, sheetOpen, openSheet, closeSheet } = useAdminBranchSheetHook();
  const { showSheet: showUserSheet } = useAdminUserSheetHook();

  return (
    <header className={adminAppBar({ scrolled })}>
      <ProtectedBranchScope compact={compact} onPress={showSheet ? openSheet : undefined} />
      {compact ? <span className={adminAppBarTitle}>{title}</span> : null}
      <div className={adminAppBarActions}>
        <SyncIndicator />
        {showUserSheet ? <AdminUserSheet /> : <ProtectedUserMenu />}
      </div>
      {showSheet ? (
        <AppSheet open={sheetOpen} title="Branch" onClose={closeSheet}>
          <BranchScopeList listClassName={branchSheetList} onSelect={closeSheet} />
        </AppSheet>
      ) : null}
    </header>
  );
};

export default AdminAppBar;
