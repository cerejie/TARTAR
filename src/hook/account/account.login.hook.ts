import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  loginSchema,
  type ILoginInput,
} from "../../models/data/account/account.request";
import accountServices from "../../services/data/account.services";
import { useAccountStore } from "../../store/data/account/account.store";
import {
  adminBasePath,
  isAdminPath,
  resetLocation,
} from "../../utils/route.utils";
import { useMutation } from "../common/mutation.hook";
import { useAdminManifestHook } from "../layout/admin.manifest.hook";

export const useAccountLoginHook = () => {
  const { pathname } = useLocation();
  const isAdminLogin = isAdminPath(pathname);
  const homePath = isAdminLogin ? adminBasePath : "/";
  useAdminManifestHook(isAdminLogin);
  const setCustomSession = useAccountStore((state) => state.setCustomSession);
  const setDeveloperSession = useAccountStore(
    (state) => state.setDeveloperSession
  );

  const { control, handleSubmit } = useForm<ILoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation(async (values: ILoginInput) => {
    const session = await accountServices.login(values);
    resetLocation(homePath);

    if (session) {
      setCustomSession(session.token, session.user);
      return;
    }
    setDeveloperSession(values.email);
  });

  return {
    control,
    loginMutation,
    onSubmit: handleSubmit((values) => void loginMutation.mutate(values)),
  };
};
