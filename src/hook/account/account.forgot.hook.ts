import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  forgotEmailSchema,
  type IForgotEmailInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import {
  selectResetStep,
  useAuthFlowStore,
} from "../../store/data/account/auth.flow.store";
import { useMutation } from "../common/mutation.hook";

export const useAccountForgotHook = () => {
  const step = useAuthFlowStore(selectResetStep);
  const setResetDone = useAuthFlowStore((state) => state.setResetDone);
  const resetFlow = useAuthFlowStore((state) => state.reset);
  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<IForgotEmailInput>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const requestMutation = useMutation(
    (values: IForgotEmailInput) =>
      accountServices.requestPasswordHelp(values.email),
    {
      onSuccess: () => {
        reset();
        setResetDone();
      },
    }
  );

  return {
    step,
    control,
    requestMutation,
    backToSignIn: () => {
      resetFlow();
      navigate("/login");
    },
    onSubmit: handleSubmit((values) => void requestMutation.mutate(values)),
  };
};
