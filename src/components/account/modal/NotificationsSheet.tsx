import NotificationsControls from "../views/NotificationsControls";
import AccountPanelSheet from "./AccountPanelSheet";

type IProps = {
  description: string;
};

const NotificationsSheet = ({ description }: IProps) => (
  <AccountPanelSheet panel="notifications" description={description}>
    <NotificationsControls />
  </AccountPanelSheet>
);

export default NotificationsSheet;
