import type { ReactNode } from "react";
import { cn } from "@/utils/cn.utils";
import {
  recordHero,
  recordHeroAmount,
  recordHeroName,
} from "../../../styles/app/app.styles";
import { toneText } from "../../../styles/common/tone.styles";
import { formatMoney } from "../../../utils/format.utils";

import type { Tone } from "../../../styles/common/tone.styles";

type IProps = {
  name: string;
  amount: number;
  amountTone?: Tone;
  badge?: ReactNode;
};

const RecordHero = ({ name, amount, amountTone = "default", badge }: IProps) => {
  return (
    <div className={recordHero}>
      <span className={recordHeroName}>{name}</span>
      <span className={cn(recordHeroAmount, toneText({ tone: amountTone }))}>
        {formatMoney(amount)}
      </span>
      {badge}
    </div>
  );
};

export default RecordHero;
