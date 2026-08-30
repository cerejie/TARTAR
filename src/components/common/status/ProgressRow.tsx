import { Flex } from "antd";
import { tone, type Tone } from "../../../styles/common/tone.css";
import {
  progressDot,
  progressFill,
  progressHead,
  progressLabel,
  progressRow,
  progressTrack,
  progressUnit,
  progressValue,
} from "../../../styles/status/status.css";

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
    <Flex vertical className={`${progressRow}`}>
      <Flex className={`${progressHead}`} align="baseline">
        <span className={`${progressValue}`}>
          {display ?? clamped.toFixed(0)}
          {unit ? <span className={`${progressUnit}`}>{unit}</span> : null}
        </span>
        <span className={`${progressLabel}`}>
          {label}
          <span
            className={`${progressDot} ${tone[variant]}`}
            aria-hidden="true"
          />
        </span>
      </Flex>
      <div
        className={`${progressTrack}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span
          className={`${progressFill} ${tone[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </Flex>
  );
};

export default ProgressRow;
