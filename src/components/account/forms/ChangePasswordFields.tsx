import { KeyRound, Lock, LockKeyhole } from "lucide-react";
import { passwordForm } from "../../../styles/account/account.styles";
import FormField from "../../common/form/FormField";

import type { FormEventHandler, ReactNode } from "react";
import type { Control } from "react-hook-form";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IChangePasswordInput } from "../../../models/data/account/account.request";

type IProps = {
  id?: string;
  control: Control<IChangePasswordInput>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children?: ReactNode;
};

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

const ChangePasswordFields = ({ id, control, onSubmit, children }: IProps) => (
  <form id={id} className={passwordForm} onSubmit={onSubmit} noValidate>
    {fields.map((field) => (
      <FormField key={field.name} config={field} control={control} />
    ))}
    {children}
  </form>
);

export default ChangePasswordFields;
