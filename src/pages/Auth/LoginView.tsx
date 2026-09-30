import { Lock, Mail } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import ForgotPasswordHint from "../../components/auth/ForgotPasswordHint";
import AppButton from "../../components/common/button/AppButton";
import FormField from "../../components/common/form/FormField";
import { useAccountLoginHook } from "../../hook/account/account.login.hook";
import {
  authAlt,
  authAltLink,
  authForm,
  authMeta,
  authSubmit,
} from "../../styles/layout/public.styles";
import type { IFieldConfig } from "../../models/common/field.model";
import type { ILoginInput } from "../../models/data/account/account.request";

const fields: IFieldConfig<ILoginInput>[] = [
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "you@company.com",
    icon: <Mail />,
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    icon: <Lock />,
    autoComplete: "current-password",
  },
];

const LoginView = () => {
  const { control, loginMutation, onSubmit } = useAccountLoginHook();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your business."
    >
      <form className={authForm} onSubmit={onSubmit} noValidate>
        {fields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <div className={authMeta}>
          <ForgotPasswordHint />
        </div>

        <AppButton
          type="submit"
          loading={loginMutation.loading}
          className={authSubmit}
        >
          Sign in
        </AppButton>
      </form>

      <p className={authAlt}>
        New employee?
        <AppButton href="/register" variant="link" className={authAltLink}>
          Create an account
        </AppButton>
      </p>
    </AuthShell>
  );
};

export default LoginView;
