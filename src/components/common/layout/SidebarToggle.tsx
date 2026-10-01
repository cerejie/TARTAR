import { Menu } from "lucide-react";
import { useSidebarToggleHook } from "../../../hook/layout/protected.hook";
import { headerMenuButton } from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";

const SidebarToggle = () => {
  const { showToggle, menuOpen, openMenu } = useSidebarToggleHook();

  if (!showToggle) return null;

  return (
    <AppButton
      variant="ghost"
      size="icon"
      aria-label="Open menu"
      aria-expanded={menuOpen}
      className={headerMenuButton}
      onPress={openMenu}
    >
      <Menu aria-hidden="true" />
    </AppButton>
  );
};

export default SidebarToggle;
