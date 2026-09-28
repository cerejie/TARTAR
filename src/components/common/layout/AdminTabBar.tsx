import { LinkButton } from "@/components/ui/button";
import { useAdminTabBarHook } from "../../../hook/layout/admin.hook";
import {
  adminTabBar,
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
                <span className={adminTabIndicator({ active })} aria-hidden="true">
                  {Icon ? <Icon /> : null}
                  {badge ? <span className={countBadge}>{badge}</span> : null}
                </span>
                {route.label}
              </LinkButton>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminTabBar;
