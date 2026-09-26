import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  infoCard,
  infoCardAction,
  infoCardBody,
  infoCardHead,
  infoCardMeta,
  infoCardSkeletonAction,
  infoCardSkeletonChip,
  infoCardSkeletonText,
  infoCardSkeletonTitle,
  infoCardText,
  infoCardTitle,
} from "../../../styles/card/card.styles";

type IProps = {
  chip?: ReactNode;
  meta?: ReactNode;
  title?: string;
  text?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
};

const InfoCard = ({ chip, meta, title, text, action, loading }: IProps) => {
  if (loading) {
    return (
      <Card size="sm" className={infoCard} aria-busy>
        <CardContent className={infoCardBody}>
          <Skeleton className={infoCardSkeletonChip} />
          <Skeleton className={infoCardSkeletonTitle} />
          <Skeleton className={infoCardSkeletonText} />
          <Skeleton className={infoCardSkeletonAction} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className={infoCard}>
      <CardContent className={infoCardBody}>
        <div className={infoCardHead}>
          {chip}
          {meta ? <span className={infoCardMeta}>{meta}</span> : null}
        </div>
        {title ? <h3 className={infoCardTitle}>{title}</h3> : null}
        {text ? <p className={infoCardText}>{text}</p> : null}
        {action ? <div className={infoCardAction}>{action}</div> : null}
      </CardContent>
    </Card>
  );
};

export default InfoCard;
