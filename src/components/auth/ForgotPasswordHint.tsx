import { Dialog } from "react-aria-components";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  authHint,
  authPopover,
  authPopoverDialog,
} from "../../styles/layout/public.styles";
import AppButton from "../common/button/AppButton";

const ForgotPasswordHint = () => {
  return (
    <PopoverTrigger>
      <AppButton variant="link" className={authHint}>
        Forgot password?
      </AppButton>
      <Popover placement="top end" className={authPopover}>
        <Dialog aria-label="Password reset" className={authPopoverDialog}>
          Password resets are handled by your administrator — ask them to set a
          new one for your account.
        </Dialog>
      </Popover>
    </PopoverTrigger>
  );
};

export default ForgotPasswordHint;
