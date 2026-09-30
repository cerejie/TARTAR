import { Hourglass, Lock, LockKeyhole, Mail } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import AuthSuccessPanel from "../../components/auth/AuthSuccessPanel";
import AppButton from "../../components/common/button/AppButton";
import FormField from "../../components/common/form/FormField";
import { useAccountForgotHook } from "../../hook/account/account.forgot.hook";
import {
  authAlt,
  authAltLink,
  authForm,
  authSubmit,
} from "../../styles/layout/public.styles";
import type { IFieldConfig } from "../../models/common/field.model";
import type {
  IForgotEmailInput,
  IForgotPasswordInput,
} from "../../models/data/account/account.request";

const emailFields: IFieldConfig<IForgotEmailInput>[] = [
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "you@company.com",
    icon: <Mail />,
    autoComplete: "email",
  },
];

const passwordFields: IFieldConfig<IForgotPasswordInput>[] = [
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
    placeholder: "Type the password again",
    icon: <LockKeyhole />,
  },
];

const ForgotPasswordView = () => {
  const {
    step,
    email,
    emailControl,
    passwordControl,
    emailMutation,
    passwordMutation,
    backToSignIn,
    onEmailSubmit,
    onPasswordSubmit,
  } = useAccountForgotHook();

  if (step === "done") {
    return (
      <AuthShell
        title="Request sent"
        subtitle="Your new password is not active yet."
      >
        <AuthSuccessPanel
          icon={<Hourglass />}
          title="Waiting for admin approval"
          message="Please contact your admin. Once they approve the request, sign in with your new password."
          onBack={backToSignIn}
        />
      </AuthShell>
    );
  }

  if (step === "password") {
    return (
      <AuthShell title="Set a new password" subtitle={`For ${email}`}>
        <form className={authForm} onSubmit={onPasswordSubmit} noValidate>
          {passwordFields.map((field) => (
            <FormField key={field.name} config={field} control={passwordControl} />
          ))}

          <AppButton
            type="submit"
            loading={passwordMutation.loading}
            className={authSubmit}
          >
            Request password reset
          </AppButton>
        </form>

        <p className={authAlt}>
          Remembered it?
          <AppButton variant="link" className={authAltLink} onPress={backToSignIn}>
            Sign in
          </AppButton>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter the email you sign in with."
    >
      <form className={authForm} onSubmit={onEmailSubmit} noValidate>
        {emailFields.map((field) => (
          <FormField key={field.name} config={field} control={emailControl} />
        ))}

        <AppButton
          type="submit"
          loading={emailMutation.loading}
          className={authSubmit}
        >
          Continue
        </AppButton>
      </form>

      <p className={authAlt}>
        Remembered it?
        <AppButton href="/login" variant="link" className={authAltLink}>
          Sign in
        </AppButton>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordView;
