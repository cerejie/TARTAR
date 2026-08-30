import { Descriptions, Empty, Skeleton } from "antd";
import type { ReactNode } from "react";
import type { IDetailItem } from "../../../models/common/detail.model";
import type { ModalSize } from "../../../models/common/view.model";
import { modalEmpty } from "../../../styles/modal/modal.css";
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
  return (
    <AppModal
      open={open}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={footer}
      onClose={onClose}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: items.length }} />
      ) : record ? (
        <Descriptions
          column={1}
          size="small"
          bordered
          items={items.map((item) => ({
            key: item.key,
            label: item.label,
            span: item.span,
            children: item.render(record),
          }))}
        />
      ) : (
        <Empty className={`${modalEmpty}`} description={emptyText} />
      )}
    </AppModal>
  );
};

export default DetailModal;
