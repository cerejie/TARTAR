import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  progressCell,
  progressCellHead,
  progressCellPercent,
  progressCellTotal,
  progressCellTrack,
  progressCellValue,
} from "../../../styles/table/table.styles";

type IProps = {
  value: number;
  total: number;
  label: string;
  format?: (amount: number) => string;
};

const ProgressCell = ({ value, total, label, format = String }: IProps) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <Progress value={percent} aria-label={label} className={progressCell}>
      <span className={progressCellHead}>
        <span>
          <span className={progressCellValue}>{format(value)}</span>
          <span className={progressCellTotal}> / {format(total)}</span>
        </span>
        <span className={progressCellPercent}>({percent.toFixed(0)}%)</span>
      </span>
      <ProgressTrack className={progressCellTrack}>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
};

export default ProgressCell;
