import { usePushNotifications } from "../../../hook/common/push.hook";
import { pushModeSubtitles } from "../../../models/common/push.model";
import SectionCard from "../../common/card/SectionCard";
import NotificationsControls from "../views/NotificationsControls";

const NotificationsCard = () => {
  const { mode } = usePushNotifications();

  return (
    <SectionCard title="Notifications" subtitle={pushModeSubtitles[mode]}>
      <NotificationsControls />
    </SectionCard>
  );
};

export default NotificationsCard;
