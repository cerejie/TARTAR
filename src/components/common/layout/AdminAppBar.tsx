import { useAdminBranchSheetHook } from "../../../hook/layout/admin.hook";
import { branchSheetList } from "../../../styles/app/app.styles";
import { adminAppBar, adminAppBarActions } from "../../../styles/admin/admin.layout.styles";
import AppSheet from "../app/AppSheet";
import SyncIndicator from "../status/SyncIndicator";
import BranchScopeList from "./BranchScopeList";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";

const AdminAppBar = () => {
  const { showSheet, sheetOpen, openSheet, closeSheet } = useAdminBranchSheetHook();

  return (
    <header className={adminAppBar}>
      <ProtectedBranchScope onPress={showSheet ? openSheet : undefined} />
      <div className={adminAppBarActions}>
        <SyncIndicator />
        <ProtectedUserMenu />
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
