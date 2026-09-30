import { userDisplayNamesKey, userListKey } from "../../../keys/query.keys";
import type {
  IUser,
  IUserDisplayName,
} from "../../../models/data/account/account.response";
import userServices from "../../../services/data/user.services";
import { useQuery } from "../../common/query.hook";
import { usePermissions } from "../../account/account.permission.hook";

export const useUserListHook = () => {
  const permissions = usePermissions();
  const query = useQuery<IUser[]>(userListKey, () => userServices.getList(), {
    enabled: permissions.isManager,
  });
  const displayNamesQuery = useQuery<IUserDisplayName[]>(
    userDisplayNamesKey,
    () => userServices.getDisplayNames(),
    { enabled: !permissions.isManager }
  );

  const users = query.data ?? [];
  const userById = new Map(users.map((user) => [user.id, user]));
  const displayNameById = new Map(
    permissions.isManager
      ? users.map((user) => [user.id, user.full_name || user.username])
      : (displayNamesQuery.data ?? []).map((row) => [row.id, row.name])
  );

  return {
    ...query,
    users,
    userById,
    userNameOf: (id: string | null) =>
      (id ? displayNameById.get(id) : undefined) ?? "—",
  };
};
