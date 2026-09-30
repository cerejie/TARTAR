import { truncateCell } from "../../../styles/table/table.styles";

type IProps = {
  text: string;
};

const TruncateCell = ({ text }: IProps) => (
  <span className={truncateCell} title={text}>
    {text}
  </span>
);

export default TruncateCell;
