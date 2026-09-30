import { Hourglass, Lock, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import AuthSuccessPanel from "../../components/auth/AuthSuccessPanel";
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
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "you@company.com",
    icon: <Mail />,
    autoComplete: "email",
  },
  {
    name: "full_name",
    label: "Full name",
    type: "text",
    placeholder: "Juan Dela Cruz",
    icon: <UserRound />,
    autoComplete: "name",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "At least 6 characters",
    icon: <Lock />,
  },
  {
    name: "confirm_password",
    label: "Confirm password",
    type: "password",
    placeholder: "Type the password again",
    icon: <LockKeyhole />,
  },
];

const RegisterView = () => {
  const { control, registered, registerMutation, backToSignIn, onSubmit } =
    useAccountRegisterHook();

  if (registered) {
    return (
      <AuthShell
        title="Account created"
        subtitle="One more step before you can sign in."
      >
        <AuthSuccessPanel
          icon={<Hourglass />}
          title="Waiting for approval"
          message="An administrator reviews your registration and assigns your role and branches. You can sign in once it is approved."
          onBack={backToSignIn}
        />
      </AuthShell>
    );
  }

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
