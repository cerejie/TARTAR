import { LogOut, Monitor, Moon, Smartphone, Sun, UserCog } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utils/cn.utils";
import { useAdminUserSheetHook } from "../../../hook/layout/admin.hook";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  adminUserSheetDanger,
  adminUserSheetHead,
  adminUserSheetItem,
  adminUserSheetList,
  adminUserSheetName,
  adminUserSheetRole,
  adminUserSheetText,
} from "../../../styles/admin/admin.layout.styles";
import {
  headerUserAvatarFallback,
  headerUserOnline,
  headerUserTrigger,
} from "../../../styles/layout/header.styles";
import AppSheet from "../app/AppSheet";
import AppButton from "../button/AppButton";

const AdminUserSheet = () => {
  const {
    displayName,
    roleLabel,
    initial,
    online,
    isDark,
    toggleMode,
    logoutMutation,
    appSwitch,
  } = useProtectedUserHook();
  const { sheetOpen, openSheet, closeSheet } = useAdminUserSheetHook();

  const avatar = (
    <Avatar size="lg">
      <AvatarFallback className={headerUserAvatarFallback}>{initial}</AvatarFallback>
      {online ? <AvatarBadge className={headerUserOnline} /> : null}
    </Avatar>
  );

  const handleToggleMode = () => {
    toggleMode();
    closeSheet();
  };

  return (
    <>
      <AppButton
        variant="ghost"
        aria-label="Account menu"
        className={headerUserTrigger}
        onPress={openSheet}
      >
        {avatar}
      </AppButton>
      <AppSheet open={sheetOpen} title="Account" onClose={closeSheet}>
        <div className={adminUserSheetHead}>
          {avatar}
          <span className={adminUserSheetText}>
            <span className={adminUserSheetName}>{displayName}</span>
            <span className={adminUserSheetRole}>{roleLabel}</span>
          </span>
        </div>
        <nav aria-label="Account" className={adminUserSheetList}>
          {appSwitch ? (
            <AppButton variant="ghost" href={appSwitch.href} className={adminUserSheetItem}>
              {appSwitch.toAdmin ? <Smartphone /> : <Monitor />}
              {appSwitch.label}
            </AppButton>
          ) : null}
          <AppButton variant="ghost" href="/account" className={adminUserSheetItem}>
            <UserCog />
            Account settings
          </AppButton>
          <AppButton variant="ghost" className={adminUserSheetItem} onPress={handleToggleMode}>
            {isDark ? <Sun /> : <Moon />}
            {isDark ? "Light mode" : "Dark mode"}
          </AppButton>
          <AppButton
            variant="ghost"
            className={cn(adminUserSheetItem, adminUserSheetDanger)}
            onPress={() => logoutMutation.mutate()}
          >
            <LogOut />
            Sign out
          </AppButton>
        </nav>
      </AppSheet>
    </>
  );
};

export default AdminUserSheet;
