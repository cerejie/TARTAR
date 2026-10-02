import ContextSwitch from "../../common/view/ContextSwitch";
import {
  voucherStatusLabels,
  voucherStatusValues,
} from "../../../enums/voucher.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { voucherPaginationKey } from "../../../keys/table.keys";
import {
  allSegmentKey,
  statusOfSegment,
  statusSegmentOptionsOf,
} from "../../../utils/segment.utils";

const VouchersStatusTabs = () => {
  const { value, changeValue } = useFilterField(
    "vouchers",
    "voucherStatus",
    voucherPaginationKey
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

export default VouchersStatusTabs;
