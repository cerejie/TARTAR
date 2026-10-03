import type { ReactNode } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn.utils";
import {
  sectionCardBody,
  sectionCardExtra,
  sectionCardFlushBody,
  sectionCardFooter,
  sectionCardInset,
  sectionCardRoot,
  sectionCardSkeleton,
  sectionCardTitle,
} from "../../../styles/card/card.styles";
import ErrorState from "../status/ErrorState";

type IProps = {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  stackExtra?: boolean;
  flush?: boolean;
  dense?: boolean;
  footer?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: ReactNode;
};

const SectionCard = ({
  title,
  subtitle,
  extra,
  stackExtra = false,
  flush = false,
  dense = false,
  footer,
  loading = false,
  error,
  onRetry,
  children,
}: IProps) => {
  const inset = flush ? sectionCardInset : undefined;

  const renderBody = () => {
    if (loading) return <Skeleton className={sectionCardSkeleton} />;
    if (error) {
      return (
        <ErrorState
          compact
          title={title ? `${title} unavailable` : undefined}
          description={error}
          onAction={onRetry}
        />
      );
    }
    return children;
  };

  return (
    <Card
      size={dense ? "sm" : "default"}
      className={sectionCardRoot({ flush })}
    >
      {title || subtitle || extra ? (
        <CardHeader className={inset}>
          {title ? (
            <CardTitle className={sectionCardTitle}>{title}</CardTitle>
          ) : null}
          {subtitle ? (
            <CardDescription>{subtitle}</CardDescription>
          ) : null}
          {extra ? (
            <CardAction className={sectionCardExtra({ stacked: stackExtra })}>
              {extra}
            </CardAction>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent
        className={cn(sectionCardBody, flush && sectionCardFlushBody)}
        aria-busy={loading}
      >
        {renderBody()}
      </CardContent>

      {footer ? (
        <CardFooter className={cn(sectionCardFooter, inset)}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
};

export default SectionCard;
