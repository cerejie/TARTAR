import { rowFocusParamKey } from "../../../keys/table.keys";

export interface IInboxItem {
  id: string;
  title: string;
  body: string;
  url: string;
  tag: string | null;
  created_at: string;
  read_at: string | null;
  pending: boolean;
}

export type InboxKind = "voucher" | "payment" | "sale" | "other";

const inboxKinds: readonly InboxKind[] = ["voucher", "payment", "sale"];

const recordKindOf = (tag: string | null | undefined) =>
  inboxKinds.find((kind) => tag?.startsWith(`${kind}-`));

export const inboxKindOf = (item: IInboxItem): InboxKind =>
  recordKindOf(item.tag) ?? "other";

export const isInboxAttention = (item: IInboxItem): boolean =>
  !item.read_at || item.pending;

export const inboxTargetOf = (
  url: string,
  tag: string | null | undefined
): string => {
  const kind = recordKindOf(tag);
  if (!kind || !tag) return url;

  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  params.set(rowFocusParamKey, tag.slice(kind.length + 1));

  return `${path}?${params.toString()}`;
};
