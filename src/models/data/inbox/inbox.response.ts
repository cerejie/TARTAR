export interface IInboxItem {
  id: string;
  title: string;
  body: string;
  url: string;
  tag: string | null;
  created_at: string;
  read_at: string | null;
}

export type InboxKind = "voucher" | "payment" | "sale" | "other";

const inboxKinds: readonly InboxKind[] = ["voucher", "payment", "sale"];

export const inboxKindOf = (item: IInboxItem): InboxKind =>
  inboxKinds.find((kind) => item.tag?.startsWith(`${kind}-`)) ?? "other";
