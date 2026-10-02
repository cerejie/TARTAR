import ContextSwitch from "../../common/view/ContextSwitch";
import { saleStatusLabels, saleStatusValues } from "../../../enums/sale.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { salePaginationKey } from "../../../keys/table.keys";
import {
  allSegmentKey,
  statusOfSegment,
  statusSegmentOptionsOf,
} from "../../../utils/segment.utils";

const SaleStatusTabs = () => {
  const { value, changeValue } = useFilterField(
    "page",
    "saleStatus",
    salePaginationKey
  );

  return (
    <ContextSwitch
      label="Sale status"
      value={value ?? allSegmentKey}
      options={statusSegmentOptionsOf(saleStatusValues, saleStatusLabels)}
      onChange={(key) => changeValue(statusOfSegment(key, saleStatusValues))}
    />
  );
};

export default SaleStatusTabs;
