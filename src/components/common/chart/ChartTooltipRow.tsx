import type { ReactNode } from "react";
import {
  chartTooltipName,
  chartTooltipRow,
  chartTooltipValue,
} from "../../../styles/chart/chart.styles";

type IProps = {
  label: ReactNode;
  value: string;
};

const ChartTooltipRow = ({ label, value }: IProps) => {
  return (
    <div className={chartTooltipRow}>
      <span className={chartTooltipName}>{label}</span>
      <span className={chartTooltipValue}>{value}</span>
    </div>
  );
};

export default ChartTooltipRow;
