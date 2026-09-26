import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProtectedUserHook } from "../../../hook/layout/protected.hook";
import {
  sidebarCaret,
  sidebarUserAvatarFallback,
  sidebarUserMenu,
  sidebarUserName,
  sidebarUserOnline,
  sidebarUserRole,
  sidebarUserText,
} from "../../../styles/layout/sidebar.styles";

const ProtectedSiderUser = () => {
  const {
    displayName,
    roleLabel,
    initial,
    online,
    isDark,
    toggleMode,
    logoutMutation,
  } = useProtectedUserHook();

  const themeLabel = isDark ? "Light mode" : "Dark mode";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton size="lg" aria-label="Account menu">
            <Avatar>
              <AvatarFallback className={sidebarUserAvatarFallback}>
                {initial}
              </AvatarFallback>
              {online ? <AvatarBadge className={sidebarUserOnline} /> : null}
            </Avatar>
            <span className={sidebarUserText}>
              <span className={sidebarUserName}>{displayName}</span>
              <span className={sidebarUserRole}>{roleLabel}</span>
            </span>
            <ChevronsUpDown className={sidebarCaret} />
          </SidebarMenuButton>

          <DropdownMenu
            placement="top start"
            aria-label="Account"
            className={sidebarUserMenu}
          >
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default ProtectedSiderUser;
