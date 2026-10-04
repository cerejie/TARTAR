import type {
  ICreateUserInput,
  ILoginInput,
  IRegisterInput,
} from "../../models/data/account/account.request";
import type {
  ICustomLoginResponse,
  ILoginResult,
} from "../../models/data/account/account.response";
import { formatTime } from "../../utils/format.utils";
import {
  assertOnline,
  onlineOnly,
  onSessionExpired,
  setCustomToken,
  supabase,
  toError,
} from "../../utils/supabase.utils";

const developerRole = "developer";
const avatarBucket = "avatars";
const avatarFileName = "avatar.webp";
const invalidCredentialsMessage = "Invalid email or password.";
const wrongCurrentPasswordMessage = "Current password is incorrect";
const pendingAccountMessage =
  "Your account is waiting for administrator approval.";
const rejectedAccountMessage =
  "Your registration was declined — contact an administrator.";

const lockedAccountMessage = (retryAt: string | undefined): string =>
  retryAt
    ? `Too many wrong passwords. Try again at ${formatTime(retryAt)}, or ask an administrator to reset your password.`
    : "Too many wrong passwords. Try again later, or ask an administrator to reset your password.";

const loginRefusalOf = (result: ILoginResult): string => {
  if (result.status === "locked") return lockedAccountMessage(result.retry_at);
  if (result.status === "pending") return pendingAccountMessage;
  if (result.status === "rejected") return rejectedAccountMessage;
  return invalidCredentialsMessage;
};

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
      supabase.rpc("login_account", {
        p_email: values.email,
        p_password: values.password,
      })
    );
    if (error) throw toError(error);

    const result = data as ILoginResult;
    if (result.status === "invalid") {
      await loginDeveloper(values);
      return null;
    }
    if (result.status !== "ok" || !result.token || !result.user) {
      throw new Error(loginRefusalOf(result));
    }

    setCustomToken(result.token);
    return { token: result.token, user: result.user };
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

  requestPasswordHelp: async (email: string): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("request_password_help", { p_email: email })
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

  setOwnAvatar: async (userId: string, image: Blob): Promise<void> => {
    assertOnline();

    const path = `${userId}/${avatarFileName}`;
    const { error: uploadError } = await supabase.storage
      .from(avatarBucket)
      .upload(path, image, { upsert: true, contentType: image.type });
    if (uploadError) throw toError(uploadError);

    const { error } = await onlineOnly(supabase.rpc("set_own_avatar", { p_path: path }));
    if (error) throw toError(error);
  },

  removeOwnAvatar: async (userId: string): Promise<void> => {
    assertOnline();

    const { error } = await onlineOnly(supabase.rpc("set_own_avatar", { p_path: null }));
    if (error) throw toError(error);

    const { error: removeError } = await supabase.storage
      .from(avatarBucket)
      .remove([`${userId}/${avatarFileName}`]);
    if (removeError) throw toError(removeError);
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
