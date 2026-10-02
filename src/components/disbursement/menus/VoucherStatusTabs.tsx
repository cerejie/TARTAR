import ContextSwitch from "../../common/view/ContextSwitch";
import type { DisbursementKind } from "../../../enums/transaction.enum";
import {
  voucherStatusLabels,
  voucherStatusValues,
} from "../../../enums/voucher.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { disbursementScopeOf } from "../../../keys/query.keys";
import { disbursementPaginationKey } from "../../../keys/table.keys";
import {
  allSegmentKey,
  statusOfSegment,
  statusSegmentOptionsOf,
} from "../../../utils/segment.utils";

type IProps = {
  kind: DisbursementKind;
};

const VoucherStatusTabs = ({ kind }: IProps) => {
  const { value, changeValue } = useFilterField(
    "page",
    "voucherStatus",
    disbursementPaginationKey(disbursementScopeOf(kind))
  );

  return (
    <ContextSwitch
      label="Voucher status"
      value={value ?? allSegmentKey}
      options={statusSegmentOptionsOf(voucherStatusValues, voucherStatusLabels)}
      onChange={(key) => changeValue(statusOfSegment(key, voucherStatusValues))}
    />
  );
};

export default VoucherStatusTabs;
