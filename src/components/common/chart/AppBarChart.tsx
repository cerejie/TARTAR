import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  barChartFrame,
  chartColor,
  chartTooltipLabel,
} from "../../../styles/chart/chart.styles";
import ChartTooltipRow from "./ChartTooltipRow";

const barRadius: [number, number, number, number] = [8, 8, 0, 0];
const axisTickMargin = 8;
const axisMinTickGap = 24;

type IProps<T> = {
  label: string;
  data: readonly T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  formatX: (value: string) => string;
  formatAxis: (value: number) => string;
  formatValue: (value: number) => string;
  highlight?: (row: T) => boolean;
};

const AppBarChart = <T,>({
  label,
  data,
  xKey,
  yKey,
  formatX,
  formatAxis,
  formatValue,
  highlight,
}: IProps<T>) => {
  const config = {
    [yKey]: { label, color: chartColor.brand },
  } satisfies ChartConfig;
  const seriesFill = `var(--color-${yKey})`;

  return (
    <ChartContainer config={config} className={barChartFrame} aria-label={label}>
      <BarChart accessibilityLayer data={[...data]}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={(row: T) => row[xKey]}
          tickLine={false}
          axisLine={false}
          tickMargin={axisTickMargin}
          minTickGap={axisMinTickGap}
          interval="preserveStartEnd"
          tickFormatter={(value) => formatX(String(value))}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width="auto"
          tickFormatter={(value) => formatAxis(Number(value))}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelClassName={chartTooltipLabel}
              labelFormatter={(value) => formatX(String(value))}
              formatter={(value) => (
                <ChartTooltipRow label={label} value={formatValue(Number(value))} />
              )}
            />
          }
        />
        <Bar dataKey={(row: T) => row[yKey]} name={label} fill={seriesFill} radius={barRadius}>
          {data.map((row) => (
            <Cell
              key={String(row[xKey])}
              fill={highlight?.(row) ? chartColor.violet : seriesFill}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export default AppBarChart;
