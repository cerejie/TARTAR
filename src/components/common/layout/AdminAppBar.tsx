import {
  useAdminBranchSheetHook,
  useAdminTitleHook,
} from "../../../hook/layout/admin.hook";
import { branchSheetList } from "../../../styles/app/app.styles";
import {
  adminAppBar,
  adminAppBarActions,
  adminAppBarTitle,
} from "../../../styles/admin/admin.layout.styles";
import AppSheet from "../app/AppSheet";
import SyncIndicator from "../status/SyncIndicator";
import BranchScopeList from "./BranchScopeList";
import ProtectedBranchScope from "./ProtectedBranchScope";
import ProtectedUserMenu from "./ProtectedUserMenu";

const AdminAppBar = () => {
  const { title } = useAdminTitleHook();
  const { showSheet, sheetOpen, openSheet, closeSheet } = useAdminBranchSheetHook();

  return (
    <header className={adminAppBar}>
      <h1 className={adminAppBarTitle}>{title}</h1>
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
