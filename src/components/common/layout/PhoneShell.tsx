import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePhoneShellHook } from "../../../hook/layout/protected.phone.hook";
import {
  phoneColumn,
  phoneContent,
  phoneShell,
} from "../../../styles/layout/shell.styles";
import InboxBell from "../../inbox/menus/InboxBell";
import PullIndicator from "../app/PullIndicator";
import AppBar from "./AppBar";
import PhoneAlertsSheet from "./PhoneAlertsSheet";
import ProtectedSider from "./ProtectedSider";
import RouteProgress from "./RouteProgress";
import SidebarToggle from "./SidebarToggle";

const PhoneShell = () => {
  const { pathname, scrollRef, handleScroll, pullHandlers, title, dueCount, openAlerts } =
    usePhoneShellHook();

  return (
    <SidebarProvider className={phoneShell}>
      <RouteProgress />
      <AppBar
        title={title}
        leading={<SidebarToggle />}
        trailing={<InboxBell onPress={openAlerts} dueCount={dueCount} />}
      />

      <main
        id="main-content"
        ref={scrollRef}
        onScroll={handleScroll}
        className={phoneContent}
        {...pullHandlers}
      >
        <PullIndicator />
        <div key={pathname} className={phoneColumn}>
          <Outlet />
        </div>
      </main>

      <ProtectedSider account />
      <PhoneAlertsSheet />
    </SidebarProvider>
  );
};

export default PhoneShell;
