import { cn } from "@/utils/cn.utils";
import { toneFill, type Tone } from "../../styles/common/tone.styles";
import {
  donutLabel,
  donutLegend,
  donutLegendDot,
  donutLegendKey,
  donutLegendRow,
  donutLegendTotal,
  donutLegendValue,
  donutValue,
} from "../../styles/dashboard/dashboard.styles";
import { formatMoney } from "../../utils/format.utils";
import AppDonutChart from "../common/chart/AppDonutChart";
import EmptyState from "../common/status/EmptyState";
import type { ChartTone } from "../../models/common/view.model";

type IProps = {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
};

type ILegendItem = {
  key: string;
  label: string;
  value: number;
  tone: Tone & ChartTone;
};

const CashFlowDonut = ({ cashIn, cashOut, netCashFlow }: IProps) => {
  const hasMovement = cashIn > 0 || cashOut > 0;

  const slices: readonly ILegendItem[] = [
    { key: "cashIn", label: "Cash In", value: cashIn, tone: "positive" },
    { key: "cashOut", label: "Cash Out", value: cashOut, tone: "negative" },
  ];

  return (
    <>
      {hasMovement ? (
        <AppDonutChart
          label="Cash flow this month"
          slices={slices}
          formatValue={formatMoney}
          center={
            <>
              <span className={donutValue}>{formatMoney(netCashFlow)}</span>
              <span className={donutLabel}>Net Cash Flow</span>
            </>
          }
        />
      ) : (
        <EmptyState description="No cash movement this month" />
      )}

      <div className={donutLegend}>
        {slices.map((item) => (
          <div key={item.key} className={donutLegendRow}>
            <span className={donutLegendKey}>
              <span className={cn(donutLegendDot, toneFill({ tone: item.tone }))} />
              {item.label}
            </span>
            <span className={donutLegendValue}>{formatMoney(item.value)}</span>
          </div>
        ))}
        <div className={donutLegendTotal}>
          <span className={donutLegendKey}>Net Cash Flow</span>
          <span className={donutLegendValue}>{formatMoney(netCashFlow)}</span>
        </div>
      </div>
    </>
  );
};

export default CashFlowDonut;
