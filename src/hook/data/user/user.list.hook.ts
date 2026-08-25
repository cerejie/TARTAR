import { userListKey } from "../../../keys/query.keys";
import type { IUser } from "../../../models/data/account/account.response";
import userServices from "../../../services/data/user.services";
import { useQuery } from "../../common/query.hook";
import { usePermissions } from "../../account/account.permission.hook";

export const useUserListHook = () => {
  const permissions = usePermissions();
  const query = useQuery<IUser[]>(userListKey, () => userServices.getList(), {
    enabled: permissions.isManager,
  });

  const users = query.data ?? [];
  const userById = new Map(users.map((user) => [user.id, user]));

  return {
    ...query,
    users,
    userById,
    userNameOf: (id: string | null) => {
      const user = id ? userById.get(id) : undefined;
      return user ? user.full_name || user.username : "—";
    },
  };
};
