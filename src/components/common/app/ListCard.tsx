import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button as PressArea } from "react-aria-components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/utils/cn.utils";
import {
  listCard,
  listCardAmount,
  listCardAside,
  listCardAvatarFallback,
  listCardChevron,
  listCardContent,
  listCardDescription,
  listCardFigures,
  listCardMedia,
  listCardMeta,
  listCardName,
  listCardNamePress,
  listCardUnreadDot,
} from "../../../styles/app/app.styles";
import { toneText } from "../../../styles/common/tone.styles";
import { formatInitials, formatMoney } from "../../../utils/format.utils";

import type { Tone } from "../../../styles/common/tone.styles";

type IProps = {
  name: string;
  description?: ReactNode;
  meta?: ReactNode;
  amount?: number;
  icon?: ReactNode;
  amountTone?: Tone;
  badge?: ReactNode;
  unread?: boolean;
  pending?: boolean;
  selected?: boolean;
  onPress?: () => void;
};

const ListCard = ({
  name,
  description,
  meta,
  amount,
  icon,
  amountTone = "default",
  badge,
  unread = false,
  pending = false,
  selected = false,
  onPress,
}: IProps) => {
  return (
    <Item
      role="listitem"
      size="sm"
      aria-current={selected ? "true" : undefined}
      className={listCard({ selected, unread })}
    >
      <ItemMedia className={listCardMedia}>
        {pending ? (
          <span className={listCardUnreadDot({ tone: "pending" })} role="img" aria-label="Waiting" />
        ) : null}
        {unread && !pending ? (
          <span className={listCardUnreadDot({ tone: "unread" })} role="img" aria-label="Unread" />
        ) : null}
        <Avatar size="lg">
          <AvatarFallback className={listCardAvatarFallback}>
            {icon ?? formatInitials(name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className={listCardContent}>
        <ItemTitle className={listCardName({ unread })}>
          {onPress ? (
            <PressArea className={listCardNamePress} onPress={onPress}>
              {name}
            </PressArea>
          ) : (
            name
          )}
        </ItemTitle>
        {description ? (
          <ItemDescription className={listCardDescription}>{description}</ItemDescription>
        ) : null}
        {meta ? <ItemDescription className={listCardMeta}>{meta}</ItemDescription> : null}
      </ItemContent>
      <ItemActions className={listCardAside}>
        <span className={listCardFigures}>
          {amount === undefined ? null : (
            <span className={cn(listCardAmount, toneText({ tone: amountTone }))}>
              {formatMoney(amount)}
            </span>
          )}
          {badge}
        </span>
        {onPress ? <ChevronRight className={listCardChevron} aria-hidden="true" /> : null}
      </ItemActions>
    </Item>
  );
};

export default ListCard;
