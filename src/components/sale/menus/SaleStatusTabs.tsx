import StatusFilterTabs from "../../common/filter/StatusFilterTabs";
import { saleStatusLabels, saleStatusValues } from "../../../enums/sale.enum";
import { useFilterField } from "../../../hook/common/filter.hook";
import { salePaginationKey } from "../../../keys/table.keys";

const SaleStatusTabs = () => {
  const { value, changeValue } = useFilterField(
    "page",
    "saleStatus",
    salePaginationKey
  );

  return (
    <StatusFilterTabs
      label="Sale status"
      value={value}
      values={saleStatusValues}
      labels={saleStatusLabels}
      onChange={changeValue}
    />
  );
};

export default SaleStatusTabs;
