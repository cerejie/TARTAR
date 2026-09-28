import { LinkButton } from "@/components/ui/button";
import { useAdminTabBarHook } from "../../../hook/layout/admin.hook";
import {
  adminTabBar,
  adminTabIndicator,
  adminTabItem,
  adminTabList,
} from "../../../styles/admin/admin.layout.styles";

const AdminTabBar = () => {
  const { tabs, isActive } = useAdminTabBarHook();

  return (
    <nav aria-label="Admin" className={adminTabBar}>
      <ul className={adminTabList}>
        {tabs.map((route) => {
          const path = route.path ?? "/";
          const active = isActive(path);
          const Icon = route.icon;

          return (
            <li key={path}>
              <LinkButton
                href={path}
                variant="ghost"
                aria-current={active ? "page" : undefined}
                className={adminTabItem({ active })}
                onHoverStart={() => void route.preload?.()}
                onFocus={() => void route.preload?.()}
              >
                <span className={adminTabIndicator({ active })} aria-hidden="true">
                  {Icon ? <Icon /> : null}
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
