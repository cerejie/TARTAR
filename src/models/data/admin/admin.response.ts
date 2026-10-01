import dayjs from "dayjs";
import type { StatusColor } from "../../common/view.model";
import type { NotificationTone } from "../dashboard/dashboard.response";
import type { IPayable, IReceivable } from "../ledger/ledger.response";
import type { IVoucher } from "../voucher/voucher.response";

export const dueHorizonDays = 7;

export const adminPayableSegmentValues = ["checks", "nearDue", "overdue"] as const;
export type AdminPayableSegment = (typeof adminPayableSegmentValues)[number];

export const adminPayableSegmentLabels: Record<AdminPayableSegment, string> = {
  checks: "Checks",
  nearDue: "Near due",
  overdue: "Overdue",
};

export const adminPayableSegmentCaptions: Record<AdminPayableSegment, string> = {
  checks: `Approved checks dated within ${dueHorizonDays} days, or past-dated while unpaid`,
  nearDue: `Payables due within ${dueHorizonDays} days`,
  overdue: "Payables past their due date",
};

export type IAdminPayableEntry =
  | { kind: "check"; record: IVoucher }
  | { kind: "payable"; record: IPayable };

export interface IDueStatus {
  label: string;
  color: StatusColor;
}

export interface IAdminPayableRow {
  key: string;
  name: string;
  meta: string;
  amount: number;
  due: IDueStatus;
  entry: IAdminPayableEntry;
}

export const adminReceivableSegmentValues = ["overdue", "today", "week"] as const;
export type AdminReceivableSegment = (typeof adminReceivableSegmentValues)[number];

export const adminReceivableSegmentLabels: Record<AdminReceivableSegment, string> = {
  overdue: "Overdue",
  today: "Due today",
  week: "This week",
};

export const adminReceivableSegmentCaptions: Record<AdminReceivableSegment, string> = {
  overdue: "Receivables past their due date",
  today: "Receivables due today",
  week: `Receivables due within the next ${dueHorizonDays} days`,
};

export interface IAdminReceivableRow {
  key: string;
  name: string;
  meta: string;
  amount: number;
  due: IDueStatus;
  record: IReceivable;
}

export const dayCountLabel = (days: number) => (days === 1 ? "1 day" : `${days} days`);

export const daysUntil = (dueDate: string): number =>
  dayjs(dueDate).startOf("day").diff(dayjs().startOf("day"), "day");

export const dueStatusOf = (dueDate: string): IDueStatus => {
  const days = daysUntil(dueDate);
  if (days < 0) return { label: `${dayCountLabel(-days)} overdue`, color: "negative" };
  if (days === 0) return { label: "Due today", color: "warning" };
  return { label: `Due in ${dayCountLabel(days)}`, color: "warning" };
};

export const checkDueDateOf = (check: Pick<IVoucher, "check_due_date">): string =>
  check.check_due_date ?? "";

export const adminNotificationSegmentValues = ["all", "unread"] as const;
export type AdminNotificationSegment = (typeof adminNotificationSegmentValues)[number];

export const adminNotificationSegmentLabels: Record<AdminNotificationSegment, string> = {
  all: "All",
  unread: "Unread",
};

export interface IAdminNotification {
  id: string;
  name: string;
  description: string;
  amount: number;
  path: string;
  unread: boolean;
}

export interface IAdminNotificationGroup {
  key: string;
  label: string;
  tone: NotificationTone;
  items: IAdminNotification[];
}
