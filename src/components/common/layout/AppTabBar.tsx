import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/utils/cn.utils";
import {
  appTabBadge,
  appTabBar,
  appTabIcon,
  appTabIndicator,
  appTabItem,
  appTabList,
} from "../../../styles/app/app.bar.styles";
import { countBadge } from "../../../styles/status/status.styles";

import type { ITabItem } from "../../../models/common/tab.model";

type IProps = {
  label: string;
  tabs: readonly ITabItem[];
};

const AppTabBar = ({ label, tabs }: IProps) => (
  <nav aria-label={label} className={appTabBar}>
    <ul className={appTabList}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const ariaLabel = tab.badge ? `${tab.label}, ${tab.badge} new` : undefined;
        const content = (
          <>
            <span className={appTabIcon} aria-hidden="true">
              {Icon ? <Icon /> : null}
              {tab.badge ? <span className={cn(countBadge, appTabBadge)}>{tab.badge}</span> : null}
            </span>
            {tab.label}
            {tab.active ? <span className={appTabIndicator} aria-hidden="true" /> : null}
          </>
        );

        return (
          <li key={tab.key}>
            {tab.href ? (
              <LinkButton
                href={tab.href}
                variant="ghost"
                aria-current={tab.active ? "page" : undefined}
                aria-label={ariaLabel}
                className={appTabItem({ active: tab.active })}
                onHoverStart={() => void tab.preload?.()}
                onFocus={() => void tab.preload?.()}
              >
                {content}
              </LinkButton>
            ) : (
              <Button
                variant="ghost"
                aria-label={ariaLabel}
                aria-haspopup="dialog"
                className={appTabItem({ active: tab.active })}
                onPress={tab.onPress}
              >
                {content}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  </nav>
);

export default AppTabBar;
