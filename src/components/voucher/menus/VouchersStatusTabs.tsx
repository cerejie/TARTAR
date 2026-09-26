import StatusFilterTabs from "../../common/filter/StatusFilterTabs";
import {
  voucherStatusLabels,
  voucherStatusValues,
} from "../../../enums/voucher.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { voucherPaginationKey } from "../../../keys/table.keys";

const VouchersStatusTabs = () => {
  const { value, changeValue } = useFilterField(
    "vouchers",
    "voucherStatus",
    voucherPaginationKey
  );

  return (
    <StatusFilterTabs
      label="Voucher status"
      value={value}
      values={voucherStatusValues}
      labels={voucherStatusLabels}
      onChange={changeValue}
    />
  );
};

export default VouchersStatusTabs;
