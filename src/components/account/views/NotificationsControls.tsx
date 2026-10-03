import { usePushNotifications } from "../../../hook/common/push.hook";
import {
  notificationsActions,
  notificationsBody,
  notificationsText,
} from "../../../styles/account/account.styles";
import NotificationsToggle from "./NotificationsToggle";

const NotificationsControls = () => {
  const { note, canToggle } = usePushNotifications();

  return (
    <div className={notificationsBody}>
      <p className={notificationsText}>{note}</p>
      {canToggle ? (
        <div className={notificationsActions}>
          <NotificationsToggle />
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsControls;
