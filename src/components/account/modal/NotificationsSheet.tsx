import { usePushNotifications } from "../../../hook/common/push.hook";
import { sheetActions } from "../../../styles/app/app.styles";
import { notificationsText } from "../../../styles/account/account.styles";
import NotificationsToggle from "../views/NotificationsToggle";
import AccountPanelSheet from "./AccountPanelSheet";

type IProps = {
  description: string;
};

const NotificationsSheet = ({ description }: IProps) => {
  const { note, canToggle } = usePushNotifications();
  const footer = canToggle ? (
    <div className={sheetActions}>
      <NotificationsToggle />
    </div>
  ) : undefined;

  return (
    <AccountPanelSheet
      panel="notifications"
      description={description}
      footer={footer}
    >
      <p className={notificationsText}>{note}</p>
    </AccountPanelSheet>
  );
};

export default NotificationsSheet;
