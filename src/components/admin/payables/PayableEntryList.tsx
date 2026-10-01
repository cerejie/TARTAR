import { CircleCheck } from "lucide-react";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import StatusTag from "../../common/status/StatusTag";

import type { IAdminPayableRow } from "../../../models/data/admin/admin.response";

type IProps = {
  caption: string;
  rows: readonly IAdminPayableRow[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  isSelected: (row: IAdminPayableRow) => boolean;
  onOpen: (row: IAdminPayableRow) => void;
};

const PayableEntryList = ({
  caption,
  rows,
  loading,
  refreshing,
  error,
  onRetry,
  isSelected,
  onOpen,
}: IProps) => {
  return (
    <ListSection
      title={caption}
      itemCount={rows.length}
      emptyText="Nothing due here"
      emptyIcon={<CircleCheck />}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRetry={onRetry}
    >
      {rows.map((row) => (
        <ListCard
          key={row.key}
          name={row.name}
          meta={row.meta}
          amount={row.amount}
          badge={<StatusTag label={row.due.label} color={row.due.color} />}
          selected={isSelected(row)}
          onPress={() => onOpen(row)}
        />
      ))}
    </ListSection>
  );
};

export default PayableEntryList;
