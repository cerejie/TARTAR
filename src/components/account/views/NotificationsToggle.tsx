import { usePushNotifications } from "../../../hook/common/push.hook";
import AppSwitch from "../../common/form/AppSwitch";

const NotificationsToggle = () => {
  const { mode, toggle, busy } = usePushNotifications();

  return (
    <AppSwitch
      label="Notifications on this device"
      isSelected={mode === "on"}
      isDisabled={busy}
      onChange={toggle}
    />
  );
};

export default NotificationsToggle;
