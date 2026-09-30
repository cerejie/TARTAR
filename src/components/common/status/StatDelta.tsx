import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import { toneText } from "../../../styles/common/tone.styles";
import { statDelta } from "../../../styles/status/status.styles";
import { statDeltaPercent } from "../../../utils/stat.utils";

type IProps = {
  current: number | undefined;
  previous: number | undefined;
  goodDirection: "up" | "down";
  label: string;
};

const StatDelta = ({ current, previous, goodDirection, label }: IProps) => {
  const percent = statDeltaPercent(current, previous);
  if (percent === undefined) return null;

  const isUp = percent >= 0;
  const isGood = isUp === (goodDirection === "up");

  return (
    <span
      className={cn(statDelta, toneText({ tone: isGood ? "positive" : "negative" }))}
      title={label}
    >
      {isUp ? <ArrowUp /> : <ArrowDown />}
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
};

export default StatDelta;
