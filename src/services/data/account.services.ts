import type {
  ICreateUserInput,
  ILoginInput,
  IRegisterInput,
} from "../../models/data/account/account.request";
import type { ICustomLoginResponse } from "../../models/data/account/account.response";
import {
  assertOnline,
  onlineOnly,
  onSessionExpired,
  setCustomToken,
  supabase,
  toError,
} from "../../utils/supabase.utils";

const accountNotApprovedCode = "28000";
const invalidCredentialsCode = "28P01";
const developerRole = "developer";
const invalidCredentialsMessage = "Invalid email or password.";
const wrongCurrentPasswordMessage = "Current password is incorrect";

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

    const { data, error } = await onlineOnly(
      supabase.rpc("login_email", {
        p_email: values.email,
        p_password: values.password,
      })
    );
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
    const { error } = await onlineOnly(
      supabase.rpc("register_email", {
        p_email: values.email,
        p_full_name: values.full_name,
        p_password: values.password,
      })
    );
    if (error) throw toError(error);
  },

  emailExists: async (email: string): Promise<boolean> => {
    const { data, error } = await onlineOnly(
      supabase.rpc("account_email_exists", {
        p_email: email,
      })
    );
    if (error) throw toError(error);

    return data === true;
  },

  requestPasswordReset: async (
    email: string,
    password: string
  ): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("request_password_reset", {
        p_email: email,
        p_password: password,
      })
    );
    if (error) throw toError(error);
  },

  changeOwnPassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("change_own_password", {
        p_current_password: currentPassword,
        p_new_password: newPassword,
      })
    );
    if (error) throw toError(error);
  },

  changeDeveloperPassword: async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    assertOnline();

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verifyError) throw new Error(wrongCurrentPasswordMessage);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw toError(error);
  },

  logout: async (): Promise<void> => {
    setCustomToken(null);
    await supabase.auth.signOut().catch(() => undefined);
  },

  createUser: async (values: ICreateUserInput): Promise<string> => {
    const { data, error } = await onlineOnly(
      supabase.rpc("admin_create_user_email", {
        p_email: values.email,
        p_password: values.password,
        p_full_name: values.full_name,
        p_role: values.role,
        p_branch_access: values.branch_access,
        p_access_flags: values.access_flags,
      })
    );
    if (error) throw toError(error);

    return data as string;
  },

  setUserPassword: async (
    userId: string,
    password: string
  ): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("admin_set_password", {
        p_user_id: userId,
        p_password: password,
      })
    );
    if (error) throw toError(error);
  },
};

export default accountServices;
