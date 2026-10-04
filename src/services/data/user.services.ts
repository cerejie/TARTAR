import type { ApprovalStatus } from "../../enums/role.enum";
import type { IUpdateUserInput } from "../../models/data/account/account.request";
import type {
  IUser,
  IUserAvatar,
  IUserDisplayName,
} from "../../models/data/account/account.response";
import { runWrite } from "../../store/common/sync.store";
import { onlineOnly, supabase, toError } from "../../utils/supabase.utils";

const table = "users";
const avatarBucket = "avatars";

const columns =
  "id, email, username, full_name, role, access_flags, approval_status, branch_access, password_reset_requested_at, created_at, updated_at";

const userServices = {
  getList: async (status?: ApprovalStatus): Promise<IUser[]> => {
    let query = supabase.from(table).select(columns);
    if (status) query = query.eq("approval_status", status);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw toError(error);

    return (data ?? []) as IUser[];
  },

  getDisplayNames: async (): Promise<IUserDisplayName[]> => {
    const { data, error } = await supabase.rpc("user_display_names");
    if (error) throw toError(error);

    return (data ?? []) as IUserDisplayName[];
  },

  getAvatars: async (): Promise<IUserAvatar[]> => {
    const { data, error } = await supabase
      .from(table)
      .select("id, avatar_path, updated_at")
      .not("avatar_path", "is", null);
    if (error) throw toError(error);

    return (data ?? []) as IUserAvatar[];
  },

  avatarUrlOf: (avatar: IUserAvatar): string | undefined => {
    if (!avatar.avatar_path) return undefined;
    const { data } = supabase.storage.from(avatarBucket).getPublicUrl(avatar.avatar_path);
    return `${data.publicUrl}?v=${encodeURIComponent(avatar.updated_at)}`;
  },

  dismissPasswordReset: async (id: string): Promise<void> => {
    const { error } = await onlineOnly(
      supabase.rpc("dismiss_password_reset", { p_user_id: id })
    );
    if (error) throw toError(error);
  },

  update: (id: string, values: IUpdateUserInput) =>
    runWrite({
      label: "Update user",
      kind: "update",
      table,
      values,
      match: { id },
    }),

  setApproval: (id: string, status: ApprovalStatus) =>
    runWrite({
      label: `${status} user`,
      kind: "update",
      table,
      values: { approval_status: status },
      match: { id },
    }),

  remove: (id: string) =>
    runWrite({ label: "Delete user", kind: "delete", table, match: { id } }),
};

export default userServices;
