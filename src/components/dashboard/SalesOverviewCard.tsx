import {
  salesAxisFormats,
  salesPeriodLabels,
  salesPeriodSubtitles,
  salesPeriodValues,
  type IDailySalesPoint,
  type SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import {
  formatDatePattern,
  formatMoney,
  formatMoneyCompact,
} from "../../utils/format.utils";
import { segmentOptionsOf } from "../../utils/segment.utils";
import SectionCard from "../common/card/SectionCard";
import AppBarChart from "../common/chart/AppBarChart";
import EmptyState from "../common/status/EmptyState";
import ContextSwitch from "../common/view/ContextSwitch";

type IProps = {
  salesPeriod: SalesPeriod;
  onSalesPeriodChange: (period: SalesPeriod) => void;
  series: IDailySalesPoint[];
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
};

const SalesOverviewCard = ({
  salesPeriod,
  onSalesPeriodChange,
  series,
  loading,
  error,
  onRetry,
}: IProps) => {
  const latestDate = series.length ? series[series.length - 1].date : null;
  const hasSales = series.length > 0;

  return (
    <SectionCard
      title="Sales trend"
      subtitle={salesPeriodSubtitles[salesPeriod]}
      error={error}
      onRetry={onRetry}
      extra={
        <ContextSwitch
          label="Sales period"
          value={salesPeriod}
          options={segmentOptionsOf(salesPeriodValues, salesPeriodLabels)}
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
        <EmptyState
          title="No sales yet"
          description="Recorded sales for this period will chart here."
          loading={loading}
        />
      )}
    </SectionCard>
  );
};

export default SalesOverviewCard;
