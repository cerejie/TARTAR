import {
  salesAxisFormats,
  salesPeriodLabels,
  salesPeriodValues,
  type IDailySalesPoint,
  type SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import {
  formatDatePattern,
  formatMoney,
  formatMoneyCompact,
} from "../../utils/format.utils";
import SectionCard from "../common/card/SectionCard";
import AppBarChart from "../common/chart/AppBarChart";
import EmptyState from "../common/status/EmptyState";
import ViewSwitch from "../common/view/ViewSwitch";

type IProps = {
  salesPeriod: SalesPeriod;
  onSalesPeriodChange: (period: SalesPeriod) => void;
  series: IDailySalesPoint[];
  loading: boolean;
};

const SalesOverviewCard = ({
  salesPeriod,
  onSalesPeriodChange,
  series,
  loading,
}: IProps) => {
  const latestDate = series.length ? series[series.length - 1].date : null;
  const hasSales = series.length > 0;

  return (
    <SectionCard
      title="Sales Overview"
      extra={
        <ViewSwitch
          value={salesPeriod}
          values={salesPeriodValues}
          labels={salesPeriodLabels}
          onChange={onSalesPeriodChange}
        />
      }
    >
      {!loading && hasSales ? (
        <AppBarChart<IDailySalesPoint>
          label="Sales"
          data={series}
          xKey="date"
          yKey="total"
          formatX={(value) =>
            formatDatePattern(value, salesAxisFormats[salesPeriod])
          }
          formatAxis={formatMoneyCompact}
          formatValue={formatMoney}
          highlight={(row) => row.date === latestDate}
        />
      ) : (
        <EmptyState description="No sales recorded yet" loading={loading} />
      )}
    </SectionCard>
  );
};

export default SalesOverviewCard;
