import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useProtectedMenuHook } from "../../../hook/layout/protected.hook";
import {
  sidebarGroupLabel,
  sidebarMenuButton,
} from "../../../styles/layout/sidebar.styles";

type IProps = {
  pinned?: boolean;
};

const ProtectedMenu = ({ pinned = false }: IProps) => {
  const { groups, activePath } = useProtectedMenuHook(pinned);

  if (groups.length === 0) return null;

  return (
    <nav aria-label={pinned ? "Administration" : "Main"}>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className={sidebarGroupLabel}>
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.routes.map((route) => {
                const path = route.path ?? "/";
                const active = activePath === path;
                const Icon = route.icon;

                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      href={path}
                      isActive={active}
                      tooltip={route.label}
                      aria-current={active ? "page" : undefined}
                      className={sidebarMenuButton}
                      onHoverStart={() => void route.preload?.()}
                      onFocus={() => void route.preload?.()}
                    >
                      {Icon ? <Icon aria-hidden="true" /> : null}
                      <span>{route.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
};

export default ProtectedMenu;
