import AvatarCell from "../../../common/table/AvatarCell";
import { userRoleLabels } from "../../../../enums/role.enum";
import { useAvatarUrls } from "../../../../hook/account/account.avatar.hook";
import { emptyCell } from "../../../../styles/table/table.styles";
import type { IUser } from "../../../../models/data/account/account.response";

type IProps = {
  user: IUser | undefined;
};

const UserCell = ({ user }: IProps) => {
  const avatarUrlOf = useAvatarUrls();

  if (!user) return <span className={emptyCell}>—</span>;

  return (
    <AvatarCell
      name={user.full_name || user.username}
      hint={userRoleLabels[user.role]}
      src={avatarUrlOf(user.id)}
    />
  );
};

export default UserCell;
