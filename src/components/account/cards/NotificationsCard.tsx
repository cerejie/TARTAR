import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "../../../hook/common/push.hook";
import {
  notificationsActions,
  notificationsBody,
  notificationsText,
} from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";

import type { PushMode } from "../../../models/common/push.model";

const notificationSubtitles: Record<PushMode, string> = {
  on: "Notifications are on for this device.",
  off: "Get notified on this device when something needs you.",
  blocked: "Notifications are blocked on this device.",
  "needs-install": "Install TARTAR to get notifications on this iPhone or iPad.",
  unsupported: "This browser cannot show notifications from TARTAR.",
  unconfigured: "Notifications are not set up for TARTAR yet.",
};

const notificationNotes: Record<Exclude<PushMode, "on" | "off">, string> = {
  blocked:
    "Allow notifications for TARTAR in your browser or device settings, then come back here.",
  "needs-install":
    "Add TARTAR to your home screen (see Install app), open it from there, then turn notifications on here.",
  unsupported: "Open TARTAR in Chrome, Edge or Safari, or install it as an app.",
  unconfigured: "Ask your administrator to finish the notification setup.",
};

const notificationsSummary =
  "Vouchers and payments waiting for approval, decisions on the records you submitted, and a due digest every morning at 8.";

const NotificationsCard = () => {
  const { mode, enable, disable, enabling, disabling } = usePushNotifications();

  return (
    <SectionCard title="Notifications" subtitle={notificationSubtitles[mode]}>
      <div className={notificationsBody}>
        {mode === "on" || mode === "off" ? (
          <>
            <p className={notificationsText}>{notificationsSummary}</p>
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
    </SectionCard>
  );
};

export default NotificationsCard;
