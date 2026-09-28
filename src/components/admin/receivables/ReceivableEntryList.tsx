import { CircleCheck } from "lucide-react";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import StatusTag from "../../common/status/StatusTag";

import type { IAdminReceivableRow } from "../../../models/data/admin/admin.response";

type IProps = {
  caption: string;
  rows: readonly IAdminReceivableRow[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (row: IAdminReceivableRow) => void;
};

const ReceivableEntryList = ({
  caption,
  rows,
  loading,
  refreshing,
  error,
  onRetry,
  onOpen,
}: IProps) => {
  return (
    <ListSection
      title={caption}
      itemCount={rows.length}
      emptyText="Nothing to collect here"
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
          onPress={() => onOpen(row)}
        />
      ))}
    </ListSection>
  );
};

export default ReceivableEntryList;
