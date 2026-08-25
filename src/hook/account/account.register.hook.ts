import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  registerSchema,
  type IRegisterInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import { useMutation } from "../common/mutation.hook";

export const useAccountRegisterHook = () => {
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm<IRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerMutation = useMutation(accountServices.register, {
    successMessage:
      "Account created — an admin must approve it before you can sign in.",
    onSuccess: () => navigate("/login"),
  });

  return {
    control,
    registerMutation,
    onSubmit: handleSubmit((values) => void registerMutation.mutate(values)),
  };
};
