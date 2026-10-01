import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import {
  headerUserAvatarFallback,
  headerUserOnline,
} from "../../../styles/layout/header.styles";

type IProps = {
  initial: string;
  online: boolean;
};

const AccountAvatar = ({ initial, online }: IProps) => (
  <Avatar size="lg">
    <AvatarFallback className={headerUserAvatarFallback}>{initial}</AvatarFallback>
    {online ? <AvatarBadge className={headerUserOnline} /> : null}
  </Avatar>
);

export default AccountAvatar;
