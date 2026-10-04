import { Bell, BellOff, CheckCheck, Clock, FileCheck2, Receipt, Wallet } from "lucide-react";
import { cn } from "@/utils/cn.utils";
import { useMinuteClock } from "../../../hook/common/clock.hook";
import { useInboxListHook } from "../../../hook/data/inbox/inbox.list.hook";
import { inboxKindOf } from "../../../models/data/inbox/inbox.response";
import { inboxIcon, listCardNote, listCardNoteIcon } from "../../../styles/app/app.styles";
import { toneText } from "../../../styles/common/tone.styles";
import { formatDateTime, formatElapsed } from "../../../utils/format.utils";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import AppButton from "../../common/button/AppButton";

import type { LucideIcon } from "lucide-react";
import type { IInboxItem, InboxKind } from "../../../models/data/inbox/inbox.response";

type InboxSection = "action" | "updates";

const inboxIcons: Record<InboxKind, LucideIcon> = {
  voucher: FileCheck2,
  payment: Wallet,
  sale: Receipt,
  other: Bell,
};

type IMetaProps = {
  item: IInboxItem;
  now: number;
};

const InboxMeta = ({ item, now }: IMetaProps) => {
  if (!item.pending) return formatDateTime(item.created_at);

  return (
    <span className={cn(listCardNote, toneText({ tone: "warning" }))}>
      <Clock className={listCardNoteIcon} aria-hidden="true" />
      Waiting {formatElapsed(item.created_at, now)}
    </span>
  );
};

type IProps = {
  section: InboxSection;
  markAll?: boolean;
  onOpen?: () => void;
};

const InboxFeed = ({ section, markAll = true, onOpen }: IProps) => {
  const inbox = useInboxListHook();
  const now = useMinuteClock();
  const isAction = section === "action";
  const items = isAction ? inbox.pendingItems : inbox.updateItems;

  if (isAction && !items.length) return null;

  return (
    <ListSection
      title={isAction ? "Action required" : "Information"}
      meta={
        !isAction && markAll && inbox.unreadCount ? (
          <AppButton
            variant="ghost"
            size="sm"
            loading={inbox.markingAllRead}
            onPress={inbox.markAllRead}
          >
            <CheckCheck />
            Mark all read
          </AppButton>
        ) : null
      }
      itemCount={items.length}
      emptyText="No updates yet"
      emptyIcon={<BellOff />}
      loading={isAction ? false : inbox.loading}
      refreshing={inbox.refreshing}
      error={isAction ? null : inbox.error}
      onRetry={inbox.retry}
    >
      {items.map((item) => {
        const KindIcon = inboxIcons[inboxKindOf(item)];
        return (
          <ListCard
            key={item.id}
            name={item.title}
            description={item.body || undefined}
            meta={<InboxMeta item={item} now={now} />}
            icon={<KindIcon className={inboxIcon} />}
            imageSrc={inbox.actorAvatarOf(item)}
            unread={!item.read_at}
            pending={item.pending}
            onPress={() => {
              onOpen?.();
              inbox.openItem(item);
            }}
          />
        );
      })}
    </ListSection>
  );
};

export default InboxFeed;
