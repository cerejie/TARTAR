import { ArrowLeftRight, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { formatMoney } from "../../utils/format.utils";
import StatCard from "../common/card/StatCard";
import DateRangeFilter from "../common/filter/DateRangeFilter";
import FilterSelect from "../common/filter/FilterSelect";
import FilterToolbar from "../common/filter/FilterToolbar";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import ReportRowsTable from "./tables/ReportRowsTable";
import type { IDateRange } from "../../models/common/period.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import type {
  IBranchSummaryRow,
  IBranchSummaryTotals,
  IReportState,
} from "../../models/data/report/report.response";

const renderMoney = (value: number) => formatMoney(value);

const columns: IDataTableColumn<IBranchSummaryRow>[] = [
  { title: "Branch", mobile: "title", dataIndex: "branchName" },
  { title: "Sales", dataIndex: "sales", align: "right", render: renderMoney },
  { title: "Expenses", dataIndex: "expenses", align: "right", render: renderMoney },
  { title: "Purchases", dataIndex: "purchases", align: "right", render: renderMoney },
  { title: "Net", mobile: "amount", dataIndex: "net", align: "right", render: renderMoney },
];

type IProps = IReportState & {
  rows: IBranchSummaryRow[];
  totals: IBranchSummaryTotals;
  range: IDateRange;
  month: string | undefined;
  months: readonly string[];
  monthLabels: Record<string, string>;
  onMonthChange: (month: string | undefined) => void;
  onRangeChange: (from: string | undefined, to: string | undefined) => void;
};

const BranchSummaryReport = ({
  rows,
  totals,
  range,
  month,
  months,
  monthLabels,
  onMonthChange,
  onRangeChange,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  const cardState = { loading, error, onRetry };

  return (
    <>
      <FilterToolbar>
        <FilterSelect
          placeholder="Custom range"
          value={month}
          values={months}
          labels={monthLabels}
          onChange={onMonthChange}
        />
        <DateRangeFilter from={range.from} to={range.to} onChange={onRangeChange} />
      </FilterToolbar>

      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Sales"
            value={totals.sales}
            {...cardState}
            variant="positive"
            icon={<TrendingUp />}
            caption={`${formatMoney(totals.pendingSales)} pending verification`}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Expenses"
            value={totals.expenses}
            {...cardState}
            variant="negative"
            icon={<TrendingDown />}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Purchases"
            value={totals.purchases}
            {...cardState}
            variant="negative"
            icon={<ShoppingCart />}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Net"
            value={totals.net}
            {...cardState}
            variant="brand"
            icon={<ArrowLeftRight />}
          />
        </BentoCell>
      </BentoGrid>

      <ReportRowsTable<IBranchSummaryRow>
        title="Totals by Branch"
        columns={columns}
        rows={rows}
        rowKey="branch"
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={onRetry}
        emptyText="No activity in this period"
      />
    </>
  );
};

export default BranchSummaryReport;
