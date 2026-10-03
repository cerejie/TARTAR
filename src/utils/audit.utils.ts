import { saleStatusLabels } from "../enums/sale.enum";
import {
  cashAccountLabels,
  transactionTypeLabels,
} from "../enums/transaction.enum";
import { isEmptyDetailValue } from "./detail.utils";
import { formatDate, formatDateTime, formatMoney } from "./format.utils";
import type {
  IAuditChangeLine,
  ITransactionAudit,
} from "../models/data/transaction/transaction.response";

const untrackedAuditFields: readonly string[] = [
  "id",
  "created_at",
  "updated_at",
  "version",
];

const auditFieldLabels: Readonly<Record<string, string>> = {
  type: "Type",
  branch: "Branch",
  farm_section: "Farm section",
  txn_date: "Date",
  amount: "Amount",
  reference_number: "Reference",
  description: "Description",
  customer_id: "Customer",
  supplier_id: "Supplier",
  cash_account: "Cash account",
  bank_account_id: "Bank account",
  income_source: "Income source",
  expense_type: "Expense type",
  due_date: "Due date",
  sale_status: "Status",
  deposit_date: "Deposit date",
  deposited_by: "Deposited by",
  deposited_at: "Deposited at",
  verified_by: "Reviewed by",
  verified_at: "Reviewed at",
  rejection_reason: "Rejection reason",
  created_by: "Recorded by",
};

const auditValueLabels: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  type: transactionTypeLabels,
  sale_status: saleStatusLabels,
  cash_account: cashAccountLabels,
};

const moneyAuditFields: readonly string[] = ["amount"];

const humanize = (value: string): string => {
  const words = value.replaceAll("_", " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const auditFieldLabel = (field: string): string =>
  auditFieldLabels[field] ?? humanize(field);

const formatPresentAuditValue = (
  field: string,
  raw: string,
  userNameOf: (id: string | null) => string
): string | null => {
  const labels = auditValueLabels[field];
  if (labels) return labels[raw] ?? humanize(raw);
  if (moneyAuditFields.includes(field)) return formatMoney(raw);
  if (field.endsWith("_at")) return formatDateTime(raw);
  if (field.endsWith("_date")) return formatDate(raw);
  if (field.endsWith("_by")) return userNameOf(raw);
  if (field.endsWith("_id")) return null;
  return raw;
};

export const formatAuditValue = (
  field: string,
  value: unknown,
  userNameOf: (id: string | null) => string
): string | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const formatted = formatPresentAuditValue(field, String(value), userNameOf);
  return formatted === null || isEmptyDetailValue(formatted) ? null : formatted;
};

export const describeAuditChange = (
  from: string | null,
  to: string | null
): string => {
  if (from === null && to === null) return "Changed";
  if (from === null) return `Set to ${to}`;
  if (to === null) return `Cleared (was ${from})`;
  return `${from} → ${to}`;
};

export const auditChangeLines = (
  changes: ITransactionAudit["changes"],
  userNameOf: (id: string | null) => string
): IAuditChangeLine[] =>
  Object.entries(changes)
    .filter(([field]) => !untrackedAuditFields.includes(field))
    .map(([field, change]) => ({
      field,
      label: auditFieldLabel(field),
      summary: describeAuditChange(
        formatAuditValue(field, change.old, userNameOf),
        formatAuditValue(field, change.new, userNameOf)
      ),
    }));
