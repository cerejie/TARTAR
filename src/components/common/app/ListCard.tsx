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
  meta?: ReactNode;
  amount: number;
  amountTone?: Tone;
  badge?: ReactNode;
  unread?: boolean;
  selected?: boolean;
  onPress?: () => void;
};

const ListCard = ({
  name,
  meta,
  amount,
  amountTone = "default",
  badge,
  unread = false,
  selected = false,
  onPress,
}: IProps) => {
  return (
    <Item
      role="listitem"
      size="sm"
      aria-current={selected ? "true" : undefined}
      className={listCard({ selected })}
    >
      <ItemMedia className={listCardMedia}>
        {unread ? <span className={listCardUnreadDot} role="img" aria-label="Unread" /> : null}
        <Avatar size="lg">
          <AvatarFallback className={listCardAvatarFallback}>
            {formatInitials(name)}
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
        {meta ? <ItemDescription className={listCardMeta}>{meta}</ItemDescription> : null}
      </ItemContent>
      <ItemActions className={listCardAside}>
        <span className={listCardFigures}>
          <span className={cn(listCardAmount, toneText({ tone: amountTone }))}>
            {formatMoney(amount)}
          </span>
          {badge}
        </span>
        {onPress ? <ChevronRight className={listCardChevron} aria-hidden="true" /> : null}
      </ItemActions>
    </Item>
  );
};

export default ListCard;
