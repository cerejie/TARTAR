import { usePushNotifications } from "../../../hook/common/push.hook";
import { notificationsBody, notificationsText } from "../../../styles/account/account.styles";
import NotificationsToggle from "./NotificationsToggle";

const NotificationsControls = () => {
  const { note, canToggle } = usePushNotifications();

  return (
    <div className={notificationsBody}>
      {canToggle ? <NotificationsToggle /> : null}
      <p className={notificationsText}>{note}</p>
    </div>
  );
};

export default NotificationsControls;
