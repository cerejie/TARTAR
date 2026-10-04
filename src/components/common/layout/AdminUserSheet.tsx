import { useAdminUserSheetHook } from "../../../hook/layout/admin.hook";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import { headerUserTrigger } from "../../../styles/layout/header.styles";
import AppSheet from "../app/AppSheet";
import AppButton from "../button/AppButton";
import AccountAvatar from "./AccountAvatar";
import AccountSheetItems from "./AccountSheetItems";

const AdminUserSheet = () => {
  const { displayName, initial, avatarUrl, online } = useProtectedUserHook();
  const { sheetOpen, openSheet, closeSheet } = useAdminUserSheetHook();

  return (
    <>
      <AppButton
        variant="ghost"
        aria-label="Account menu"
        className={headerUserTrigger}
        onPress={openSheet}
      >
        <AccountAvatar name={displayName} initial={initial} online={online} src={avatarUrl} />
      </AppButton>
      <AppSheet open={sheetOpen} title="Account" onClose={closeSheet}>
        <AccountSheetItems onToggleMode={closeSheet} />
      </AppSheet>
    </>
  );
};

export default AdminUserSheet;
