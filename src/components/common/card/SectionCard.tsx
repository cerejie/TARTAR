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
import { cn } from "@/utils/cn.utils";
import type { CardTone } from "../../../models/common/view.model";
import {
  sectionCardExtra,
  sectionCardFlushBody,
  sectionCardFooter,
  sectionCardInset,
  sectionCardRoot,
  sectionCardSubtitle,
  sectionCardTitle,
} from "../../../styles/card/card.styles";

type IProps = {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  tone?: CardTone;
  flush?: boolean;
  dense?: boolean;
  footer?: ReactNode;
  children: ReactNode;
};

const SectionCard = ({
  title,
  subtitle,
  extra,
  tone = "surface",
  flush = false,
  dense = false,
  footer,
  children,
}: IProps) => {
  const inset = flush ? sectionCardInset : undefined;

  return (
    <Card
      size={dense ? "sm" : "default"}
      className={sectionCardRoot({ tone, flush })}
    >
      {title || subtitle || extra ? (
        <CardHeader className={inset}>
          {title ? (
            <CardTitle className={sectionCardTitle}>{title}</CardTitle>
          ) : null}
          {subtitle ? (
            <CardDescription className={sectionCardSubtitle({ tone })}>
              {subtitle}
            </CardDescription>
          ) : null}
          {extra ? (
            <CardAction className={sectionCardExtra}>{extra}</CardAction>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent className={flush ? sectionCardFlushBody : undefined}>
        {children}
      </CardContent>

      {footer ? (
        <CardFooter className={cn(sectionCardFooter, inset)}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
};

export default SectionCard;
