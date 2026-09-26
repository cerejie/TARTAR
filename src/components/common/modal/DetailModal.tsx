import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { ModalSize } from "../../../models/common/view.model";
import {
  detailLabel,
  detailList,
  detailRow,
  detailSkeletonBar,
  detailSkeletonList,
  detailValue,
} from "../../../styles/modal/modal.styles";
import AppModal from "./AppModal";

type IProps<TRecord> = {
  open: boolean;
  title: string;
  subtitle?: string;
  size?: ModalSize;
  record: TRecord | null;
  items: IDetailItem<TRecord>[];
  loading?: boolean;
  emptyText?: string;
  footer?: ReactNode;
  onClose: () => void;
};

const DetailModal = <TRecord,>({
  open,
  title,
  subtitle,
  size = "md",
  record,
  items,
  loading,
  emptyText = "Nothing recorded yet",
  footer,
  onClose,
}: IProps<TRecord>) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className={detailSkeletonList}>
          {items.map((item) => (
            <Skeleton key={item.key} className={detailSkeletonBar} />
          ))}
        </div>
      );
    }

    if (!record) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyDescription>{emptyText}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <div className={detailList}>
        {items.map((item) => (
          <div key={item.key} className={detailRow}>
            <div className={detailLabel}>{item.label}</div>
            <div className={detailValue}>{item.render(record)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppModal
      open={open}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={footer}
      onClose={onClose}
    >
      {renderBody()}
    </AppModal>
  );
};

export default DetailModal;
