import { nameCell, nameCellHint, nameCellName } from "../../../styles/table/table.styles";

type IProps = {
  name: string;
  hint?: string;
  compact?: boolean;
};

const NameCell = ({ name, hint, compact = false }: IProps) => {
  return (
    <span className={nameCell}>
      <span className={nameCellName({ compact })}>{name}</span>
      {hint ? <span className={nameCellHint({ compact })}>{hint}</span> : null}
    </span>
  );
};

export default NameCell;
