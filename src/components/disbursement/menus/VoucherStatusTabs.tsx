import StatusFilterTabs from "../../common/filter/StatusFilterTabs";
import type { DisbursementKind } from "../../../enums/transaction.enum";
import {
  voucherStatusLabels,
  voucherStatusValues,
} from "../../../enums/voucher.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { disbursementScopeOf } from "../../../hook/data/disbursement/disbursement.list.hook";
import { disbursementPaginationKey } from "../../../keys/table.keys";

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
    <StatusFilterTabs
      label="Voucher status"
      value={value}
      values={voucherStatusValues}
      labels={voucherStatusLabels}
      onChange={changeValue}
    />
  );
};

export default VoucherStatusTabs;
