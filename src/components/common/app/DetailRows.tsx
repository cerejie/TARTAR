import {
  detailRow,
  detailRowLabel,
  detailRows,
  detailRowValue,
} from "../../../styles/app/app.styles";

import type { IDetailItem } from "../../../models/common/detail.model";

type IProps<TRecord> = {
  record: TRecord;
  items: readonly IDetailItem<TRecord>[];
};

const DetailRows = <TRecord,>({ record, items }: IProps<TRecord>) => {
  return (
    <dl className={detailRows}>
      {items.map((item) => (
        <div key={item.key} className={detailRow}>
          <dt className={detailRowLabel}>{item.label}</dt>
          <dd className={detailRowValue}>{item.render(record)}</dd>
        </div>
      ))}
    </dl>
  );
};

export default DetailRows;
