import { cn } from "@/utils/cn.utils";
import { toneFill, type Tone } from "../../styles/common/tone.styles";
import {
  donutLabel,
  donutLegend,
  donutLegendDot,
  donutLegendKey,
  donutLegendRow,
  donutLegendValue,
  donutValue,
} from "../../styles/dashboard/dashboard.styles";
import { formatMoney } from "../../utils/format.utils";
import AppDonutChart from "../common/chart/AppDonutChart";
import EmptyState from "../common/status/EmptyState";

type IProps = {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
};

type ILegendItem = {
  label: string;
  value: number;
  tone: Tone;
};

const CashFlowDonut = ({ cashIn, cashOut, netCashFlow }: IProps) => {
  const hasMovement = cashIn > 0 || cashOut > 0;

  const legend: readonly ILegendItem[] = [
    { label: "Cash In", value: cashIn, tone: "positive" },
    { label: "Cash Out", value: cashOut, tone: "negative" },
    { label: "Net Cash Flow", value: netCashFlow, tone: "brand" },
  ];

  return (
    <>
      {hasMovement ? (
        <AppDonutChart
          label="Cash flow this month"
          slices={[
            { key: "cashIn", label: "Cash In", value: cashIn, tone: "positive" },
            { key: "cashOut", label: "Cash Out", value: cashOut, tone: "negative" },
          ]}
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
        {legend.map((item) => (
          <div key={item.label} className={donutLegendRow}>
            <span className={donutLegendKey}>
              <span className={cn(donutLegendDot, toneFill({ tone: item.tone }))} />
              {item.label}
            </span>
            <span className={donutLegendValue}>{formatMoney(item.value)}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default CashFlowDonut;
