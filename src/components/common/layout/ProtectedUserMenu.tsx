import { LogOut, Monitor, Moon, Smartphone, Sun, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  headerUserMenu,
  headerUserName,
  headerUserRole,
  headerUserText,
  headerUserTrigger,
} from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";
import AccountAvatar from "./AccountAvatar";

const ProtectedUserMenu = () => {
  const {
    displayName,
    roleLabel,
    initial,
    avatarUrl,
    online,
    isDark,
    toggleMode,
    logoutMutation,
    appSwitch,
  } = useProtectedUserHook();

  const themeLabel = isDark ? "Light mode" : "Dark mode";

  return (
    <DropdownMenuTrigger>
      <AppButton
        variant="ghost"
        aria-label="Account menu"
        className={headerUserTrigger}
      >
        <AccountAvatar
          name={displayName}
          initial={initial}
          online={online}
          src={avatarUrl}
        />
        <span className={headerUserText}>
          <span className={headerUserName}>{displayName}</span>
          <span className={headerUserRole}>{roleLabel}</span>
        </span>
      </AppButton>
      <DropdownMenu
        placement="bottom end"
        aria-label="Account"
        className={headerUserMenu}
      >
        {appSwitch ? (
          <DropdownMenuItem
            id="app-switch"
            textValue={appSwitch.label}
            href={appSwitch.href}
          >
            {appSwitch.toAdmin ? <Smartphone /> : <Monitor />}
            {appSwitch.label}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          id="account"
          textValue="Account settings"
          href="/account"
        >
          <UserCog />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem id="theme" textValue={themeLabel} onAction={toggleMode}>
          {isDark ? <Sun /> : <Moon />}
          {themeLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          id="logout"
          textValue="Sign out"
          variant="destructive"
          onAction={() => logoutMutation.mutate()}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
};

export default ProtectedUserMenu;
