import { LogOut, Monitor, Moon, Smartphone, Sun, UserCog } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  headerUserAvatarFallback,
  headerUserMenu,
  headerUserName,
  headerUserOnline,
  headerUserRole,
  headerUserText,
  headerUserTrigger,
} from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";

const ProtectedUserMenu = () => {
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

  const themeLabel = isDark ? "Light mode" : "Dark mode";

  return (
    <DropdownMenuTrigger>
      <AppButton
        variant="ghost"
        aria-label="Account menu"
        className={headerUserTrigger}
      >
        <Avatar size="lg">
          <AvatarFallback className={headerUserAvatarFallback}>
            {initial}
          </AvatarFallback>
          {online ? <AvatarBadge className={headerUserOnline} /> : null}
        </Avatar>
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
