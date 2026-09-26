import { Lock, User } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import AppButton from "../../components/common/button/AppButton";
import FormField from "../../components/common/form/FormField";
import { useAccountRegisterHook } from "../../hook/account/account.register.hook";
import {
  authAlt,
  authAltLink,
  authForm,
  authSubmit,
} from "../../styles/layout/public.styles";
import type { IFieldConfig } from "../../models/common/field.model";
import type { IRegisterInput } from "../../models/data/account/account.request";

const fields: IFieldConfig<IRegisterInput>[] = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "letters and numbers only",
    icon: <User />,
    autoComplete: "username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Choose a strong password",
    icon: <Lock />,
  },
];

const RegisterView = () => {
  const { control, registerMutation, onSubmit } = useAccountRegisterHook();

  return (
    <AuthShell
      title="Create your account"
      subtitle="An admin approves new registrations before first sign-in."
    >
      <form className={authForm} onSubmit={onSubmit} noValidate>
        {fields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <AppButton
          type="submit"
          loading={registerMutation.loading}
          className={authSubmit}
        >
          Create account
        </AppButton>
      </form>

      <p className={authAlt}>
        Already have an account?
        <AppButton href="/login" variant="link" className={authAltLink}>
          Sign in
        </AppButton>
      </p>
    </AuthShell>
  );
};

export default RegisterView;
