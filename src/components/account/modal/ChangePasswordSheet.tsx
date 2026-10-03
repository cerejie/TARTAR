import { useAccountSettingsHook } from "../../../hook/account/account.settings.hook";
import {
  changePasswordFormId,
  passwordSubtitle,
} from "../../../models/data/account/account.response";
import { sheetActions } from "../../../styles/app/app.styles";
import AppButton from "../../common/button/AppButton";
import ChangePasswordFields from "../forms/ChangePasswordFields";
import AccountPanelSheet from "./AccountPanelSheet";

const ChangePasswordSheet = () => {
  const { control, passwordMutation, onPasswordSubmit } =
    useAccountSettingsHook();

  return (
    <AccountPanelSheet
      panel="password"
      description={passwordSubtitle}
      footer={
        <div className={sheetActions}>
          <AppButton
            type="submit"
            form={changePasswordFormId}
            loading={passwordMutation.loading}
          >
            Update password
          </AppButton>
        </div>
      }
    >
      <ChangePasswordFields
        id={changePasswordFormId}
        control={control}
        onSubmit={onPasswordSubmit}
      />
    </AccountPanelSheet>
  );
};

export default ChangePasswordSheet;
