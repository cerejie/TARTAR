import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/utils/cn.utils";
import { toneFill, type Tone } from "../../../styles/common/tone.styles";
import {
  progressDot,
  progressHead,
  progressLabel,
  progressRow,
  progressUnit,
  progressValue,
} from "../../../styles/status/status.styles";

type IProps = {
  label: string;
  percent: number;
  display?: string;
  unit?: string;
  variant?: Tone;
};

const ProgressRow = ({
  label,
  percent,
  display,
  unit = "%",
  variant = "default",
}: IProps) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <Progress value={clamped} aria-label={label} className={progressRow}>
      <div className={progressHead}>
        <span className={progressValue}>
          {display ?? clamped.toFixed(0)}
          {unit ? <span className={progressUnit}>{unit}</span> : null}
        </span>
        <span className={progressLabel}>
          {label}
          <span
            className={cn(progressDot, toneFill({ tone: variant }))}
            aria-hidden="true"
          />
        </span>
      </div>
      <ProgressTrack>
        <ProgressIndicator className={toneFill({ tone: variant })} />
      </ProgressTrack>
    </Progress>
  );
};

export default ProgressRow;
