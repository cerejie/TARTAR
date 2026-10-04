import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NameCell from "./NameCell";
import { avatarCell, avatarCellFallback } from "../../../styles/table/table.styles";
import { formatInitials } from "../../../utils/format.utils";

type IProps = {
  name: string;
  hint?: string;
  src?: string;
  compact?: boolean;
};

const AvatarCell = ({ name, hint, src, compact = false }: IProps) => {
  return (
    <span className={avatarCell}>
      <Avatar size={compact ? "sm" : "default"}>
        {src ? <AvatarImage src={src} alt={name} /> : null}
        <AvatarFallback className={avatarCellFallback}>
          {formatInitials(name)}
        </AvatarFallback>
      </Avatar>
      <NameCell name={name} hint={hint} compact={compact} />
    </span>
  );
};

export default AvatarCell;
