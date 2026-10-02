import { useAlertsSheetHook } from "../../../hook/layout/protected.phone.hook";
import NotificationCenter from "../../inbox/lists/NotificationCenter";
import AppSheet from "../app/AppSheet";
import PushPromptNotice from "../status/PushPromptNotice";

const PhoneAlertsSheet = () => {
  const { open, close, title } = useAlertsSheetHook();

  return (
    <AppSheet open={open} title={title} onClose={close}>
      <PushPromptNotice />
      <NotificationCenter onOpen={close} />
    </AppSheet>
  );
};

export default PhoneAlertsSheet;
