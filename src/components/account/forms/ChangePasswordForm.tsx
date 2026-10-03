import { useAccountSettingsHook } from "../../../hook/account/account.settings.hook";
import { passwordActions } from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import ChangePasswordFields from "./ChangePasswordFields";

const ChangePasswordForm = () => {
  const { control, passwordMutation, onPasswordSubmit } =
    useAccountSettingsHook();

  return (
    <ChangePasswordFields control={control} onSubmit={onPasswordSubmit}>
      <div className={passwordActions}>
        <AppButton type="submit" loading={passwordMutation.loading}>
          Update password
        </AppButton>
      </div>
    </ChangePasswordFields>
  );
};

export default ChangePasswordForm;
