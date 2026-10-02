import { ledgerBalance } from "../models/data/ledger/ledger.response";
import {
  payablesPath,
  receivablesPath,
  salesPath,
  vouchersPath,
} from "./route.utils";

import type {
  IAttentionItem,
  IDueAlerts,
  IPendingReviews,
  NotificationTone,
} from "../models/data/dashboard/dashboard.response";

export const pendingVouchersAttentionKey = "pending-vouchers";
export const salesToVerifyAttentionKey = "sales-to-verify";

const countLabelOf = (count: number, noun: string) =>
  count === 1 ? `1 ${noun}` : `${count} ${noun}s`;

export const toAttentionItem = (
  key: string,
  name: string,
  amounts: readonly number[],
  tone: NotificationTone,
  path: string,
  noun = "account"
): IAttentionItem => ({
  key,
  name,
  meta: countLabelOf(amounts.length, noun),
  count: amounts.length,
  amount: amounts.reduce((total, amount) => total + amount, 0),
  tone,
  path,
});

export const balancesOf = (
  rows: readonly { amount: number; paid_amount: number }[]
) => rows.map(ledgerBalance);

export const dashboardAttentionItemsOf = (
  alerts: IDueAlerts | undefined,
  reviews: IPendingReviews | undefined
): IAttentionItem[] => {
  if (!alerts || !reviews) return [];
  return [
    toAttentionItem(
      "overdue-receivables",
      "Overdue receivables",
      balancesOf(alerts.overdueReceivables),
      "negative",
      receivablesPath
    ),
    toAttentionItem(
      "overdue-payables",
      "Overdue payables",
      balancesOf(alerts.overduePayables),
      "negative",
      payablesPath
    ),
    toAttentionItem(
      "near-due-payables",
      "Payables due this week",
      balancesOf(alerts.nearDuePayables),
      "warning",
      payablesPath
    ),
    toAttentionItem(
      pendingVouchersAttentionKey,
      "Vouchers awaiting approval",
      reviews.pendingVouchers,
      "warning",
      vouchersPath,
      "voucher"
    ),
    toAttentionItem(
      salesToVerifyAttentionKey,
      "Sales awaiting verification",
      reviews.salesToVerify,
      "warning",
      salesPath,
      "sale"
    ),
  ].filter((item) => item.count > 0);
};
