import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "../../../hook/common/push.hook";
import {
  notificationsActions,
  notificationsBody,
  notificationsText,
} from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";

import type { PushMode } from "../../../models/common/push.model";

const notificationNotes: Record<Exclude<PushMode, "on" | "off">, string> = {
  blocked:
    "Allow notifications for TARTAR in your browser or device settings, then come back here.",
  "needs-install":
    "Add TARTAR to your home screen (see Install app), open it from there, then turn notifications on here.",
  unsupported: "Open TARTAR in Chrome, Edge or Safari, or install it as an app.",
  unconfigured: "Ask your administrator to finish the notification setup.",
};

const NotificationsControls = () => {
  const { mode, summary, enable, disable, enabling, disabling } = usePushNotifications();

  return (
    <div className={notificationsBody}>
      {mode === "on" || mode === "off" ? (
        <>
          <p className={notificationsText}>{summary}</p>
          <div className={notificationsActions}>
            {mode === "off" ? (
              <AppButton loading={enabling} onPress={enable}>
                <Bell />
                Turn on notifications
              </AppButton>
            ) : (
              <AppButton variant="outline" loading={disabling} onPress={disable}>
                <BellOff />
                Turn off
              </AppButton>
            )}
          </div>
        </>
      ) : (
        <p className={notificationsText}>{notificationNotes[mode]}</p>
      )}
    </div>
  );
};

export default NotificationsControls;
