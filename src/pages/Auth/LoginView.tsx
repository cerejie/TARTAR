import { ArrowRight, Lock, Mail } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import AppButton from "../../components/common/button/AppButton";
import FormField from "../../components/common/form/FormField";
import { useAccountLoginHook } from "../../hook/account/account.login.hook";
import {
  authAlt,
  authAltLink,
  authDivider,
  authForm,
  authHint,
  authMeta,
  authSubmit,
} from "../../styles/layout/public.styles";
import type { IFieldConfig } from "../../models/common/field.model";
import type { ILoginInput } from "../../models/data/account/account.request";

const emailField: IFieldConfig<ILoginInput> = {
  name: "email",
  label: "Email",
  type: "text",
  placeholder: "you@company.com",
  icon: <Mail />,
  autoComplete: "email",
  inputMode: "email",
};

const passwordField: IFieldConfig<ILoginInput> = {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  icon: <Lock />,
  autoComplete: "current-password",
};

const LoginView = () => {
  const { control, loginMutation, onSubmit } = useAccountLoginHook();

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your business."
    >
      <form className={authForm} onSubmit={onSubmit} noValidate>
        <FormField config={emailField} control={control} enterKeyHint="next" />
        <FormField config={passwordField} control={control} enterKeyHint="done" />

        <div className={authMeta}>
          <AppButton href="/forgot-password" variant="link" className={authHint}>
            Forgot password?
          </AppButton>
        </div>

        <AppButton
          type="submit"
          loading={loginMutation.loading}
          className={authSubmit}
        >
          {loginMutation.loading ? "Signing in…" : "Sign in"}
          {loginMutation.loading ? null : <ArrowRight data-icon="inline-end" />}
        </AppButton>
      </form>

      <p className={authDivider} aria-hidden="true">
        or
      </p>

      <p className={authAlt}>
        New employee?
        <AppButton href="/register" variant="link" className={authAltLink}>
          Create an account
          <ArrowRight data-icon="inline-end" />
        </AppButton>
      </p>
    </AuthShell>
  );
};

export default LoginView;
