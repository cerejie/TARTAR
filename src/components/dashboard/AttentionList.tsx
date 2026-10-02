import { CircleCheck } from "lucide-react";
import ListCard from "../common/app/ListCard";
import ListSection from "../common/app/ListSection";

import type { IAttentionItem } from "../../models/data/dashboard/dashboard.response";

type IProps = {
  items: readonly IAttentionItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (item: IAttentionItem) => void;
};

const AttentionList = ({
  items,
  loading,
  refreshing,
  error,
  onRetry,
  onOpen,
}: IProps) => {
  return (
    <ListSection
      title="Needs attention"
      itemCount={items.length}
      emptyText="Nothing overdue or due this week"
      emptyIcon={<CircleCheck />}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRetry={onRetry}
    >
      {items.map((item) => (
        <ListCard
          key={item.key}
          name={item.name}
          meta={item.meta}
          amount={item.amount}
          amountTone={item.tone}
          onPress={() => onOpen(item)}
        />
      ))}
    </ListSection>
  );
};

export default AttentionList;
