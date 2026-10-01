import { Outlet } from "react-router-dom";
import {
  usePhoneShellHook,
  usePhoneTabBarHook,
} from "../../../hook/layout/protected.phone.hook";
import {
  phoneColumn,
  phoneContent,
  phoneShell,
} from "../../../styles/layout/shell.styles";
import InboxBell from "../../inbox/menus/InboxBell";
import PullIndicator from "../app/PullIndicator";
import AppBar from "./AppBar";
import AppTabBar from "./AppTabBar";
import PhoneAlertsSheet from "./PhoneAlertsSheet";
import PhoneMoreSheet from "./PhoneMoreSheet";
import RouteProgress from "./RouteProgress";

const PhoneShell = () => {
  const { pathname, scrollRef, handleScroll, pullHandlers, title } = usePhoneShellHook();
  const { tabs, showAlerts, openAlerts } = usePhoneTabBarHook();

  return (
    <div className={phoneShell}>
      <RouteProgress />
      <AppBar title={title} trailing={showAlerts ? null : <InboxBell onPress={openAlerts} />} />

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

      <AppTabBar label="Main" tabs={tabs} />
      <PhoneMoreSheet />
      <PhoneAlertsSheet />
    </div>
  );
};

export default PhoneShell;
