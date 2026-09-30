import type {
  ICreateUserInput,
  ILoginInput,
  IRegisterInput,
} from "../../models/data/account/account.request";
import type { ICustomLoginResponse } from "../../models/data/account/account.response";
import {
  onSessionExpired,
  setCustomToken,
  supabase,
  toError,
} from "../../utils/supabase.utils";

const accountNotApprovedCode = "28000";
const invalidCredentialsCode = "28P01";
const developerRole = "developer";
const invalidCredentialsMessage = "Invalid email or password.";

const approvalMessages: Record<string, string> = {
  "account is pending":
    "Your account is waiting for administrator approval.",
  "account is rejected":
    "Your registration was declined — contact an administrator.",
};

const toLoginError = (error: { code?: string; message: string }): Error =>
  error.code === accountNotApprovedCode
    ? new Error(approvalMessages[error.message] ?? error.message)
    : toError(error);

const loginDeveloper = async (values: ILoginInput): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
  if (error) throw new Error(invalidCredentialsMessage);

  const { data, error: roleError } = await supabase.rpc("my_authority_role");
  if (!roleError && data === developerRole) return;

  await supabase.auth.signOut().catch(() => undefined);
  throw new Error(invalidCredentialsMessage);
};

const accountServices = {
  login: async (values: ILoginInput): Promise<ICustomLoginResponse | null> => {
    setCustomToken(null);

    const { data, error } = await supabase.rpc("login_email", {
      p_email: values.email,
      p_password: values.password,
    });
    if (error?.code === invalidCredentialsCode) {
      await loginDeveloper(values);
      return null;
    }
    if (error) throw toLoginError(error);

    const response = data as ICustomLoginResponse;
    setCustomToken(response.token);
    return response;
  },

  restoreCustomToken: (token: string | null): void => setCustomToken(token),

  onSessionExpired: (handler: (() => void) | null): void =>
    onSessionExpired(handler),

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
    const { data, error } = await supabase.rpc("admin_create_user_email", {
      p_email: values.email,
      p_password: values.password,
      p_full_name: values.full_name,
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
