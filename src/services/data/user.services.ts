import type { ApprovalStatus } from "../../enums/role.enum";
import type { IUpdateUserInput } from "../../models/data/account/account.request";
import type {
  IUser,
  IUserDisplayName,
} from "../../models/data/account/account.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "users";

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

  decidePasswordReset: async (id: string, approve: boolean): Promise<void> => {
    const { error } = await supabase.rpc("decide_password_reset", {
      p_user_id: id,
      p_approve: approve,
    });
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
