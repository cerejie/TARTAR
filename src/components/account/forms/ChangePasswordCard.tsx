import { KeyRound, Lock, LockKeyhole } from "lucide-react";
import { useAccountSettingsHook } from "../../../hook/account/account.settings.hook";
import {
  passwordActions,
  passwordForm,
} from "../../../styles/account/account.styles";
import AppButton from "../../common/button/AppButton";
import SectionCard from "../../common/card/SectionCard";
import FormField from "../../common/form/FormField";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IChangePasswordInput } from "../../../models/data/account/account.request";

const fields: IFieldConfig<IChangePasswordInput>[] = [
  {
    name: "current_password",
    label: "Current password",
    type: "password",
    placeholder: "Enter your current password",
    icon: <KeyRound />,
    autoComplete: "current-password",
  },
  {
    name: "password",
    label: "New password",
    type: "password",
    placeholder: "At least 6 characters",
    icon: <Lock />,
  },
  {
    name: "confirm_password",
    label: "Confirm new password",
    type: "password",
    placeholder: "Type the new password again",
    icon: <LockKeyhole />,
  },
];

const ChangePasswordCard = () => {
  const { control, passwordMutation, onPasswordSubmit } =
    useAccountSettingsHook();

  return (
    <SectionCard
      title="Change password"
      subtitle="Takes effect the next time you sign in."
    >
      <form className={passwordForm} onSubmit={onPasswordSubmit} noValidate>
        {fields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <div className={passwordActions}>
          <AppButton type="submit" loading={passwordMutation.loading}>
            Update password
          </AppButton>
        </div>
      </form>
    </SectionCard>
  );
};

export default ChangePasswordCard;
