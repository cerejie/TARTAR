import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  forgotEmailSchema,
  forgotPasswordSchema,
  type IForgotEmailInput,
  type IForgotPasswordInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import {
  selectResetEmail,
  selectResetStep,
  useAuthFlowStore,
} from "../../store/data/account/auth.flow.store";
import { useMutation } from "../common/mutation.hook";

const unknownEmailMessage = "No approved account uses this email.";

export const useAccountForgotHook = () => {
  const step = useAuthFlowStore(selectResetStep);
  const email = useAuthFlowStore(selectResetEmail);
  const setResetEmail = useAuthFlowStore((state) => state.setResetEmail);
  const setResetDone = useAuthFlowStore((state) => state.setResetDone);
  const resetFlow = useAuthFlowStore((state) => state.reset);
  const navigate = useNavigate();

  const emailForm = useForm<IForgotEmailInput>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<IForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const emailMutation = useMutation(async (values: IForgotEmailInput) => {
    const exists = await accountServices.emailExists(values.email);
    if (!exists) throw new Error(unknownEmailMessage);
    setResetEmail(values.email.trim());
  });

  const passwordMutation = useMutation(
    (values: IForgotPasswordInput) =>
      accountServices.requestPasswordReset(email, values.password),
    {
      onSuccess: () => {
        passwordForm.reset();
        setResetDone();
      },
    }
  );

  return {
    step,
    email,
    emailControl: emailForm.control,
    passwordControl: passwordForm.control,
    emailMutation,
    passwordMutation,
    backToSignIn: () => {
      resetFlow();
      navigate("/login");
    },
    onEmailSubmit: emailForm.handleSubmit(
      (values) => void emailMutation.mutate(values)
    ),
    onPasswordSubmit: passwordForm.handleSubmit(
      (values) => void passwordMutation.mutate(values)
    ),
  };
};
