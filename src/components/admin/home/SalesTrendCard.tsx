import {
  salesAxisFormats,
  salesPeriodSubtitles,
} from "../../../models/data/dashboard/dashboard.response";
import {
  formatDatePattern,
  formatMoney,
  formatMoneyCompact,
} from "../../../utils/format.utils";
import SectionCard from "../../common/card/SectionCard";
import AppBarChart from "../../common/chart/AppBarChart";
import EmptyState from "../../common/status/EmptyState";

import type {
  IDailySalesPoint,
  SalesPeriod,
} from "../../../models/data/dashboard/dashboard.response";

type IProps = {
  salesPeriod: SalesPeriod;
  series: readonly IDailySalesPoint[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const SalesTrendCard = ({ salesPeriod, series, loading, error, onRetry }: IProps) => {
  const latestDate = series.length ? series[series.length - 1].date : null;
  const hasSales = series.some((point) => point.total > 0);

  return (
    <SectionCard
      title="Sales trend"
      subtitle={salesPeriodSubtitles[salesPeriod]}
      error={error}
      onRetry={onRetry}
    >
      {!loading && hasSales ? (
        <AppBarChart<IDailySalesPoint>
          label="Sales"
          data={series}
          xKey="date"
          yKey="total"
          formatX={(value) => formatDatePattern(value, salesAxisFormats[salesPeriod])}
          formatAxis={formatMoneyCompact}
          formatValue={formatMoney}
          highlight={(point) => point.date === latestDate}
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

export default SalesTrendCard;
