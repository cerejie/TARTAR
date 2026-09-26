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

const ProtectedMenu = () => {
  const { groups, activePath } = useProtectedMenuHook();

  return (
    <nav aria-label="Main">
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
