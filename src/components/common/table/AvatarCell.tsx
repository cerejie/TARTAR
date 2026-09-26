import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  avatarCell,
  avatarCellFallback,
  avatarCellName,
  avatarCellText,
  cellHint,
} from "../../../styles/table/table.styles";
import { formatInitials } from "../../../utils/format.utils";

type IProps = {
  name: string;
  hint?: string;
};

const AvatarCell = ({ name, hint }: IProps) => {
  return (
    <span className={avatarCell}>
      <Avatar>
        <AvatarFallback className={avatarCellFallback}>
          {formatInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className={avatarCellText}>
        <span className={avatarCellName}>{name}</span>
        {hint ? <span className={cellHint}>{hint}</span> : null}
      </span>
    </span>
  );
};

export default AvatarCell;
