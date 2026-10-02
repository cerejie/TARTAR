import { Bell, BellOff, CheckCheck, FileCheck2, Receipt, Wallet } from "lucide-react";
import { useMinuteClock } from "../../../hook/common/clock.hook";
import { useInboxListHook } from "../../../hook/data/inbox/inbox.list.hook";
import { inboxKindOf } from "../../../models/data/inbox/inbox.response";
import { inboxIcon } from "../../../styles/app/app.styles";
import { formatDateTime, formatElapsed } from "../../../utils/format.utils";
import ListCard from "../../common/app/ListCard";
import ListSection from "../../common/app/ListSection";
import AppButton from "../../common/button/AppButton";

import type { LucideIcon } from "lucide-react";
import type { IInboxItem, InboxKind } from "../../../models/data/inbox/inbox.response";

const inboxIcons: Record<InboxKind, LucideIcon> = {
  voucher: FileCheck2,
  payment: Wallet,
  sale: Receipt,
  other: Bell,
};

const metaOf = (item: IInboxItem, now: number): string =>
  [
    item.body,
    item.pending
      ? `Waiting ${formatElapsed(item.created_at, now)}`
      : formatDateTime(item.created_at),
  ]
    .filter(Boolean)
    .join(" · ");

type IProps = {
  onOpen?: () => void;
};

const InboxFeed = ({ onOpen }: IProps) => {
  const inbox = useInboxListHook();
  const now = useMinuteClock();

  return (
    <ListSection
      title="Updates"
      meta={
        inbox.unreadCount ? (
          <AppButton
            variant="ghost"
            size="xs"
            loading={inbox.markingAllRead}
            onPress={inbox.markAllRead}
          >
            <CheckCheck />
            Mark all read
          </AppButton>
        ) : null
      }
      itemCount={inbox.items.length}
      emptyText="No updates yet"
      emptyIcon={<BellOff />}
      loading={inbox.loading}
      refreshing={inbox.refreshing}
      error={inbox.error}
      onRetry={inbox.retry}
    >
      {inbox.items.map((item) => {
        const KindIcon = inboxIcons[inboxKindOf(item)];
        return (
          <ListCard
            key={item.id}
            name={item.title}
            meta={metaOf(item, now)}
            icon={<KindIcon className={inboxIcon} />}
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
