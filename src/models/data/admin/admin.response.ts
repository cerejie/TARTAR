import dayjs from "dayjs";
import type { StatusColor } from "../../common/view.model";
import type { IPayable } from "../ledger/ledger.response";
import type { IVoucher } from "../voucher/voucher.response";

export const dueHorizonDays = 7;

export const adminPayableSegmentValues = ["checks", "nearDue", "overdue"] as const;
export type AdminPayableSegment = (typeof adminPayableSegmentValues)[number];

export const adminPayableSegmentLabels: Record<AdminPayableSegment, string> = {
  checks: "Due checks",
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

const dayCountLabel = (days: number) => (days === 1 ? "1 day" : `${days} days`);

export const dueStatusOf = (dueDate: string): IDueStatus => {
  const days = dayjs(dueDate).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return { label: `${dayCountLabel(-days)} overdue`, color: "negative" };
  if (days === 0) return { label: "Due today", color: "warning" };
  return { label: `Due in ${dayCountLabel(days)}`, color: "warning" };
};

export const checkDueDateOf = (check: Pick<IVoucher, "check_due_date">): string =>
  check.check_due_date ?? "";
