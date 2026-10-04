import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  headerUserAvatarFallback,
  headerUserOnline,
} from "../../../styles/layout/header.styles";

type IProps = {
  name: string;
  initial: string;
  online: boolean;
  src?: string;
};

const AccountAvatar = ({ name, initial, online, src }: IProps) => (
  <Avatar size="lg">
    {src ? <AvatarImage src={src} alt={name} /> : null}
    <AvatarFallback className={headerUserAvatarFallback}>{initial}</AvatarFallback>
    {online ? <AvatarBadge className={headerUserOnline} /> : null}
  </Avatar>
);

export default AccountAvatar;
