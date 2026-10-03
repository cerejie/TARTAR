import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "../../../hook/common/push.hook";
import AppButton from "../../common/button/AppButton";

const NotificationsToggle = () => {
  const { mode, enable, disable, enabling, disabling } = usePushNotifications();

  if (mode === "off") {
    return (
      <AppButton loading={enabling} onPress={enable}>
        <Bell />
        Turn on notifications
      </AppButton>
    );
  }

  if (mode === "on") {
    return (
      <AppButton variant="outline" loading={disabling} onPress={disable}>
        <BellOff />
        Turn off
      </AppButton>
    );
  }

  return null;
};

export default NotificationsToggle;
