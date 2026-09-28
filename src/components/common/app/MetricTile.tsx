import type { ReactNode } from "react";
import { Link } from "react-aria-components";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import {
  metricTile,
  metricTileBody,
  metricTileHead,
  metricTileIcon,
  metricTileLabel,
  metricTileLink,
  metricTileSkeletonLabel,
  metricTileSkeletonValue,
  metricTileSubLine,
  metricTileValue,
} from "../../../styles/app/app.styles";
import { toneChip, toneText } from "../../../styles/common/tone.styles";
import { formatMoney } from "../../../utils/format.utils";
import ErrorState from "../status/ErrorState";

import type { Tone } from "../../../styles/common/tone.styles";

type IProps = {
  label: string;
  value: number | null | undefined;
  icon: ReactNode;
  tone?: Tone;
  subLine?: ReactNode;
  href?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const MetricTile = ({
  label,
  value,
  icon,
  tone = "brand",
  subLine,
  href,
  loading,
  error,
  onRetry,
}: IProps) => {
  if (loading) {
    return (
      <Card size="sm" className={metricTile}>
        <CardContent className={metricTileBody}>
          <Skeleton className={metricTileSkeletonLabel} />
          <Skeleton className={metricTileSkeletonValue} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className={metricTile}>
        <CardContent className={metricTileBody}>
          <ErrorState
            compact
            title={`${label} unavailable`}
            description={error}
            onAction={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  const tile = (
    <Card size="sm" className={metricTile}>
      <CardContent className={metricTileBody}>
        <div className={metricTileHead}>
          <span className={metricTileLabel}>{label}</span>
          <span className={cn(metricTileIcon, toneChip({ tone }))} aria-hidden="true">
            {icon}
          </span>
        </div>
        <span className={cn(metricTileValue, toneText({ tone }))}>
          {formatMoney(value)}
        </span>
        {subLine ? <span className={metricTileSubLine}>{subLine}</span> : null}
      </CardContent>
    </Card>
  );

  if (!href) return tile;

  return (
    <Link href={href} className={metricTileLink}>
      {tile}
    </Link>
  );
};

export default MetricTile;
