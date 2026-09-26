import type { ReactNode } from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartTone } from "../../../models/common/view.model";
import {
  chartColor,
  donutChartCenter,
  donutChartFrame,
  donutChartWrap,
} from "../../../styles/chart/chart.styles";
import ChartTooltipRow from "./ChartTooltipRow";

const donutInnerRadius = "70%";

type IDonutSlice = {
  key: string;
  label: string;
  value: number;
  tone: ChartTone;
};

type IProps = {
  label: string;
  slices: readonly IDonutSlice[];
  formatValue: (value: number) => string;
  center?: ReactNode;
};

const AppDonutChart = ({ label, slices, formatValue, center }: IProps) => {
  const config: ChartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.key,
      { label: slice.label, color: chartColor[slice.tone] },
    ])
  );
  const data = slices.map((slice) => ({
    key: slice.key,
    value: slice.value,
    fill: `var(--color-${slice.key})`,
  }));

  return (
    <div className={donutChartWrap}>
      <ChartContainer config={config} className={donutChartFrame} aria-label={label}>
        <PieChart accessibilityLayer>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                nameKey="key"
                formatter={(value, name) => (
                  <ChartTooltipRow
                    label={config[String(name)]?.label ?? name}
                    value={formatValue(Number(value))}
                  />
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={donutInnerRadius}
            strokeWidth={0}
          />
        </PieChart>
      </ChartContainer>
      {center ? <div className={donutChartCenter}>{center}</div> : null}
    </div>
  );
};

export default AppDonutChart;
