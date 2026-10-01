import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import { toneChip, toneText, type Tone } from "../../../styles/common/tone.styles";
import {
  statAffix,
  statBody,
  statCaption,
  statCard,
  statChipRow,
  statHead,
  statHeading,
  statIcon,
  statSkeletonTitle,
  statSkeletonValue,
  statTitle,
  statValue,
} from "../../../styles/stat/stat.styles";
import { formatMoney } from "../../../utils/format.utils";
import ErrorState from "../status/ErrorState";

type IProps = {
  title: string;
  value: number | string | null | undefined;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  raw?: boolean;
  prefix?: ReactNode;
  unit?: string;
  variant?: Tone;
  icon?: ReactNode;
  chip?: ReactNode;
  caption?: ReactNode;
  children?: ReactNode;
};

const StatCard = ({
  title,
  value,
  loading,
  error,
  onRetry,
  raw,
  prefix,
  unit,
  variant = "default",
  icon,
  chip,
  caption,
  children,
}: IProps) => {
  if (loading) {
    return (
      <Card size="sm" className={statCard} data-stat>
        <CardContent className={statBody}>
          <Skeleton className={statSkeletonTitle} />
          <Skeleton className={statSkeletonValue} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className={statCard} data-stat>
        <CardContent className={statBody}>
          <ErrorState
            compact
            title={`${title} unavailable`}
            description={error}
            onAction={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className={statCard} data-stat>
      <CardContent className={statBody}>
        <div className={statHead}>
          <div className={statHeading}>
            <span className={statTitle}>{title}</span>
            <span className={cn(statValue, toneText({ tone: variant }))}>
              {prefix ? <span className={statAffix}>{prefix}</span> : null}
              {raw ? (value ?? "—") : formatMoney(value)}
              {unit ? <span className={statAffix}>{unit}</span> : null}
            </span>
          </div>
          {icon ? (
            <span
              className={cn(statIcon, toneChip({ tone: variant }))}
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : null}
        </div>

        {chip ? <div className={statChipRow}>{chip}</div> : null}
        {caption ? <div className={statCaption}>{caption}</div> : null}
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
