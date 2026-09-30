import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  isEmailIdentifier,
  loginFormSchema,
  type ILoginFormInput,
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
  const setSuperAdminSession = useAccountStore(
    (state) => state.setSuperAdminSession
  );

  const { control, handleSubmit } = useForm<ILoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const loginMutation = useMutation(
    async (values: ILoginFormInput) => {
      const identifier = values.identifier.trim();

      if (isEmailIdentifier(identifier)) {
        await accountServices.loginSuperAdmin({
          email: identifier,
          password: values.password,
        });
        resetLocation(homePath);
        setSuperAdminSession(identifier);
        return;
      }

      const { token, user } = await accountServices.loginCustomUser({
        username: identifier,
        password: values.password,
      });
      resetLocation(homePath);
      setCustomSession(token, user);
    }
  );

  return {
    control,
    loginMutation,
    onSubmit: handleSubmit((values) => void loginMutation.mutate(values)),
  };
};
