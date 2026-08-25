import type {
  ICreateUserInput,
  ILoginInput,
  IRegisterInput,
  ISuperAdminLoginInput,
} from "../../models/data/account/account.request";
import type { ICustomLoginResponse } from "../../models/data/account/account.response";
import {
  setCustomToken,
  supabase,
  toError,
} from "../../utils/supabase.utils";

const accountServices = {
  loginCustomUser: async (
    values: ILoginInput
  ): Promise<ICustomLoginResponse> => {
    const { data, error } = await supabase.rpc("login", {
      p_username: values.username,
      p_password: values.password,
    });
    if (error) throw toError(error);

    const response = data as ICustomLoginResponse;
    setCustomToken(response.token);
    return response;
  },

  loginSuperAdmin: async (values: ISuperAdminLoginInput) => {
    setCustomToken(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) throw toError(error);

    return data;
  },

  restoreCustomToken: (token: string | null): void => setCustomToken(token),

  register: async (values: IRegisterInput): Promise<void> => {
    const { error } = await supabase.rpc("register", {
      p_username: values.username,
      p_password: values.password,
      p_full_name: null,
    });
    if (error) throw toError(error);
  },

  logout: async (): Promise<void> => {
    setCustomToken(null);
    await supabase.auth.signOut().catch(() => undefined);
  },

  createUser: async (values: ICreateUserInput): Promise<string> => {
    const { data, error } = await supabase.rpc("admin_create_user", {
      p_username: values.username,
      p_password: values.password,
      p_full_name: values.full_name?.trim() || null,
      p_role: values.role,
      p_branch_access: values.branch_access,
      p_access_flags: values.access_flags,
    });
    if (error) throw toError(error);

    return data as string;
  },

  setUserPassword: async (
    userId: string,
    password: string
  ): Promise<void> => {
    const { error } = await supabase.rpc("admin_set_password", {
      p_user_id: userId,
      p_password: password,
    });
    if (error) throw toError(error);
  },
};

export default accountServices;
