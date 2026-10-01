import { BellRing } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePushPrompt } from "../../../hook/common/push.hook";
import {
  pushPromptActions,
  pushPromptNotice,
} from "../../../styles/status/status.styles";
import AppButton from "../button/AppButton";

const PushPromptNotice = () => {
  const { pushPromptVisible, enablePush, enablingPush, dismissPushPrompt } =
    usePushPrompt();

  if (!pushPromptVisible) return null;

  return (
    <Alert className={pushPromptNotice}>
      <BellRing />
      <AlertTitle>Get these as notifications</AlertTitle>
      <AlertDescription>
        Vouchers and payments waiting for you, and a due digest every morning at 8.
        <div className={pushPromptActions}>
          <AppButton size="sm" loading={enablingPush} onPress={enablePush}>
            Turn on
          </AppButton>
          <AppButton size="sm" variant="ghost" onPress={dismissPushPrompt}>
            Not now
          </AppButton>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PushPromptNotice;
