import { LogOut, Monitor, Moon, Smartphone, Sun, UserCog } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  accountSheetDanger,
  accountSheetHead,
  accountSheetItem,
  accountSheetList,
  accountSheetName,
  accountSheetRole,
  accountSheetText,
} from "../../../styles/app/app.bar.styles";
import AppButton from "../button/AppButton";
import AccountAvatar from "./AccountAvatar";

type IProps = {
  onToggleMode: () => void;
};

const AccountSheetItems = ({ onToggleMode }: IProps) => {
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

  const handleToggleMode = () => {
    toggleMode();
    onToggleMode();
  };

  return (
    <>
      <div className={accountSheetHead}>
        <AccountAvatar initial={initial} online={online} />
        <span className={accountSheetText}>
          <span className={accountSheetName}>{displayName}</span>
          <span className={accountSheetRole}>{roleLabel}</span>
        </span>
      </div>
      <nav aria-label="Account" className={accountSheetList}>
        {appSwitch ? (
          <AppButton variant="ghost" href={appSwitch.href} className={accountSheetItem}>
            {appSwitch.toAdmin ? <Smartphone /> : <Monitor />}
            {appSwitch.label}
          </AppButton>
        ) : null}
        <AppButton variant="ghost" href="/account" className={accountSheetItem}>
          <UserCog />
          Account settings
        </AppButton>
        <AppButton variant="ghost" className={accountSheetItem} onPress={handleToggleMode}>
          {isDark ? <Sun /> : <Moon />}
          {isDark ? "Light mode" : "Dark mode"}
        </AppButton>
        <AppButton
          variant="ghost"
          className={cn(accountSheetItem, accountSheetDanger)}
          onPress={() => logoutMutation.mutate()}
        >
          <LogOut />
          Sign out
        </AppButton>
      </nav>
    </>
  );
};

export default AccountSheetItems;
