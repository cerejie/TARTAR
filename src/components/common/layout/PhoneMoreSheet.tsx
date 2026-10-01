import { LinkButton } from "@/components/ui/button";
import { useMoreSheetHook } from "../../../hook/layout/protected.phone.hook";
import {
  moreSheetGroup,
  moreSheetGroupLabel,
  moreSheetItem,
} from "../../../styles/app/app.bar.styles";
import AppSheet from "../app/AppSheet";
import AccountSheetItems from "./AccountSheetItems";

const PhoneMoreSheet = () => {
  const { open, close, groups, isActive } = useMoreSheetHook();

  return (
    <AppSheet open={open} title="More" onClose={close}>
      {groups.map((group) => (
        <nav key={group.label} aria-label={group.label} className={moreSheetGroup}>
          <span className={moreSheetGroupLabel}>{group.label}</span>
          {group.routes.map((route) => {
            const path = route.path ?? "";
            const active = isActive(path);
            const Icon = route.icon;

            return (
              <LinkButton
                key={path}
                href={path}
                variant="ghost"
                aria-current={active ? "page" : undefined}
                className={moreSheetItem({ active })}
                onHoverStart={() => void route.preload?.()}
              >
                {Icon ? <Icon aria-hidden="true" /> : null}
                {route.label}
              </LinkButton>
            );
          })}
        </nav>
      ))}
      <AccountSheetItems onToggleMode={close} />
    </AppSheet>
  );
};

export default PhoneMoreSheet;
