import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { dataTableEmpty } from "../../../styles/table/table.styles";

type IProps = {
  text: string;
};

const TableEmptyState = ({ text }: IProps) => {
  return (
    <Empty className={dataTableEmpty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default TableEmptyState;
