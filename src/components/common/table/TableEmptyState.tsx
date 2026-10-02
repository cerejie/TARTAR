import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { dataTableEmpty } from "../../../styles/table/table.styles";

type IProps = {
  text: string;
  hint?: string;
};

const TableEmptyState = ({ text, hint }: IProps) => {
  return (
    <Empty className={dataTableEmpty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>{text}</EmptyTitle>
        {hint ? <EmptyDescription>{hint}</EmptyDescription> : null}
      </EmptyHeader>
    </Empty>
  );
};

export default TableEmptyState;
