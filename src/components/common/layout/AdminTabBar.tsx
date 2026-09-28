import { LinkButton } from "@/components/ui/button";
import { cn } from "@/utils/cn.utils";
import { useAdminTabBarHook } from "../../../hook/layout/admin.hook";
import {
  adminTabBadge,
  adminTabBar,
  adminTabIcon,
  adminTabIndicator,
  adminTabItem,
  adminTabList,
} from "../../../styles/admin/admin.layout.styles";
import { countBadge } from "../../../styles/status/status.styles";

const AdminTabBar = () => {
  const { tabs, isActive, badgeOf } = useAdminTabBarHook();

  return (
    <nav aria-label="Admin" className={adminTabBar}>
      <ul className={adminTabList}>
        {tabs.map((route) => {
          const path = route.path ?? "/";
          const active = isActive(path);
          const Icon = route.icon;
          const badge = badgeOf(path);

          return (
            <li key={path}>
              <LinkButton
                href={path}
                variant="ghost"
                aria-current={active ? "page" : undefined}
                aria-label={badge ? `${route.label}, ${badge} unread` : undefined}
                className={adminTabItem({ active })}
                onHoverStart={() => void route.preload?.()}
                onFocus={() => void route.preload?.()}
              >
                <span className={adminTabIcon} aria-hidden="true">
                  {Icon ? <Icon /> : null}
                  {badge ? <span className={cn(countBadge, adminTabBadge)}>{badge}</span> : null}
                </span>
                {route.label}
                {active ? <span className={adminTabIndicator} aria-hidden="true" /> : null}
              </LinkButton>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminTabBar;
