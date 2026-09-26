import type { ChartTone } from "../../models/common/view.model";

export const chartColor: Record<ChartTone, string> = {
  ink: "var(--chart-1)",
  accent: "var(--chart-2)",
  brand: "var(--chart-3)",
  positive: "var(--chart-4)",
  warning: "var(--chart-5)",
  negative: "var(--chart-6)",
};

export const barChartFrame = "aspect-auto h-72 w-full";

export const donutChartWrap = "relative";

export const donutChartFrame = "mx-auto aspect-square h-56";

export const donutChartCenter =
  "pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center";

export const chartTooltipLabel = "text-foreground";

export const chartTooltipRow = "flex w-full items-center justify-between gap-4";

export const chartTooltipName = "text-muted-foreground";

export const chartTooltipValue = "font-mono font-medium tabular-nums text-foreground";
