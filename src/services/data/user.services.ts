import type { ApprovalStatus } from "../../enums/role.enum";
import type { IUpdateUserInput } from "../../models/data/account/account.request";
import type { IUser } from "../../models/data/account/account.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "users";

const columns =
  "id, username, full_name, role, access_flags, approval_status, branch_access, created_at, updated_at";

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
