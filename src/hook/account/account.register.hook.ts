import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  registerSchema,
  type IRegisterInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import {
  selectRegistered,
  useAuthFlowStore,
} from "../../store/data/account/auth.flow.store";
import { useMutation } from "../common/mutation.hook";

export const useAccountRegisterHook = () => {
  const registered = useAuthFlowStore(selectRegistered);
  const setRegistered = useAuthFlowStore((state) => state.setRegistered);
  const resetFlow = useAuthFlowStore((state) => state.reset);
  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<IRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  });

  const registerMutation = useMutation(accountServices.register, {
    onSuccess: () => {
      reset();
      setRegistered();
    },
  });

  return {
    control,
    registered,
    registerMutation,
    backToSignIn: () => {
      resetFlow();
      navigate("/login");
    },
    onSubmit: handleSubmit((values) => void registerMutation.mutate(values)),
  };
};
