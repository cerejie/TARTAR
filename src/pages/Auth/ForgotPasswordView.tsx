import { Hourglass, Mail } from "lucide-react";
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
import type { IForgotEmailInput } from "../../models/data/account/account.request";

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

const ForgotPasswordView = () => {
  const { step, control, requestMutation, backToSignIn, onSubmit } =
    useAccountForgotHook();

  if (step === "done") {
    return (
      <AuthShell
        title="Request sent"
        subtitle="Your password has not changed yet."
      >
        <AuthSuccessPanel
          icon={<Hourglass />}
          title="Contact your administrator"
          message="If an approved account uses that email, your administrator now sees the request. They will give you a temporary password — sign in with it, then change it in Account settings."
          onBack={backToSignIn}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter the email you sign in with. Your administrator sets a new password for you."
    >
      <form className={authForm} onSubmit={onSubmit} noValidate>
        {emailFields.map((field) => (
          <FormField key={field.name} config={field} control={control} />
        ))}

        <AppButton
          type="submit"
          loading={requestMutation.loading}
          className={authSubmit}
        >
          Request a new password
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
