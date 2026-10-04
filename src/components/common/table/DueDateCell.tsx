import { dueDateCell } from "../../../styles/table/table.styles";
import { formatDate } from "../../../utils/format.utils";

type IProps = {
  date: string;
  unpaid: boolean;
};

const DueDateCell = ({ date, unpaid }: IProps) => {
  return <span className={dueDateCell({ unpaid })}>{formatDate(date)}</span>;
};

export default DueDateCell;
