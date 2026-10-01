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
import PullIndicator from "../app/PullIndicator";
import AppBar from "./AppBar";
import AppTabBar from "./AppTabBar";
import PhoneAlertsSheet from "./PhoneAlertsSheet";
import PhoneMoreSheet from "./PhoneMoreSheet";
import RouteProgress from "./RouteProgress";

const PhoneShell = () => {
  const { pathname, scrollRef, handleScroll, pullHandlers, title } = usePhoneShellHook();
  const { tabs, showAlerts } = usePhoneTabBarHook();

  return (
    <div className={phoneShell}>
      <RouteProgress />
      <AppBar title={title} />

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
      {showAlerts ? <PhoneAlertsSheet /> : null}
    </div>
  );
};

export default PhoneShell;
