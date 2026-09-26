import AvatarCell from "../../../common/table/AvatarCell";
import { userRoleLabels } from "../../../../enums/role.enum";
import { emptyCell } from "../../../../styles/table/table.styles";
import type { IUser } from "../../../../models/data/account/account.response";

type IProps = {
  user: IUser | undefined;
};

const UserCell = ({ user }: IProps) => {
  if (!user) return <span className={emptyCell}>—</span>;

  return (
    <AvatarCell
      name={user.full_name || user.username}
      hint={userRoleLabels[user.role]}
    />
  );
};

export default UserCell;
