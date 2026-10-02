import type { IDetailItem } from "../../../models/common/detail.model";
import {
  detailGrid,
  detailItem,
  detailLabel,
  detailValue,
} from "../../../styles/modal/modal.styles";
import { visibleDetailItems } from "../../../utils/detail.utils";

type IProps<TRecord> = {
  record: TRecord;
  items: readonly IDetailItem<TRecord>[];
};

const DetailGrid = <TRecord,>({ record, items }: IProps<TRecord>) => {
  return (
    <div className={detailGrid}>
      {visibleDetailItems(items, record).map((item) => (
        <div key={item.key} className={detailItem({ wide: (item.span ?? 1) > 1 })}>
          <div className={detailLabel}>{item.label}</div>
          <div className={detailValue}>{item.render(record)}</div>
        </div>
      ))}
    </div>
  );
};

export default DetailGrid;
