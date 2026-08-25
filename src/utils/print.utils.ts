import {
  ledgerStatusLabels,
  paymentStatusLabels,
} from "../enums/ledger.enum";
import {
  voucherStatusLabels,
  voucherTypeLabels,
} from "../enums/voucher.enum";
import type {
  ICustomerLedgerKey,
  ICustomerReceivableSummary,
  IReceivable,
} from "../models/data/ledger/ledger.response";
import { ledgerBalance } from "../models/data/ledger/ledger.response";
import type { ILedgerPayment } from "../models/data/payment/payment.response";
import type { IVoucher } from "../models/data/voucher/voucher.response";
import { voucherPurpose } from "../models/data/voucher/voucher.response";
import { colors, fontFamilyBase } from "../styles/common/vars.css";
import { formatDate, formatDateTime, formatMoney } from "./format.utils";

export interface IPrintStat {
  label: string;
  value: string;
}

export interface IPrintColumn {
  title: string;
  numeric?: boolean;
}

export interface IPrintTable {
  title: string;
  subtitle?: string;
  columns: readonly IPrintColumn[];
  rows: readonly (readonly string[])[];
  emptyText?: string;
  highlightRows?: readonly number[];
}

export interface IPrintReportDocument {
  title: string;
  period: string;
  scope: string;
  stats?: readonly IPrintStat[];
  tables: readonly IPrintTable[];
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const openDocument = (
  width: number,
  height: number,
  html: string
): void => {
  const win = window.open("", "_blank", `width=${width},height=${height}`);
  if (!win) return;

  win.document.write(html);
  win.document.close();
};

const baseStyles = `
    body { font-family: ${fontFamilyBase}; color: ${colors.text}; padding: 40px; }
    h1 { color: ${colors.brandDark}; letter-spacing: .08em; margin: 0 0 4px; }
    .sub { color: ${colors.textMuted}; }
    table { width: 100%; border-collapse: collapse; }
    td.num, th.num { text-align: right; }`;

const autoPrint = `<script>window.onload = function () { window.print(); };</script>`;

export const printVoucher = (voucher: IVoucher, branchName: string): void => {
  const checkRows: [string, string][] =
    voucher.type === "check"
      ? [
          ["Bank issuing", voucher.check_bank ?? "—"],
          ["Check No.", voucher.check_number ?? "—"],
          [
            "Check due date",
            voucher.check_due_date ? formatDate(voucher.check_due_date) : "—",
          ],
        ]
      : [];

  const rows: [string, string][] = [
    ["Voucher No.", voucher.voucher_no ?? "—"],
    ["Type", voucherTypeLabels[voucher.type]],
    ["Branch", branchName],
    ["Payee", voucher.payee],
    ["Amount", formatMoney(voucher.amount)],
    ["Purpose", voucherPurpose(voucher)],
    ...checkRows,
    ["Status", voucherStatusLabels[voucher.status]],
    ["Created", formatDateTime(voucher.created_at)],
    ["Approved at", formatDateTime(voucher.approved_at)],
  ];

  openDocument(
    720,
    900,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voucher ${escapeHtml(voucher.voucher_no ?? "")}</title>
  <style>${baseStyles}
    .sub { margin-bottom: 24px; }
    td { padding: 10px 8px; border-bottom: 1px solid ${colors.border}; vertical-align: top; }
    td.label { color: ${colors.textMuted}; width: 180px; }
    td.value { font-weight: 600; }
    .amount { font-size: 20px; color: ${colors.brandDark}; }
    .sign { margin-top: 64px; display: flex; justify-content: space-between; }
    .sign div { border-top: 1px solid ${colors.text}; padding-top: 6px; width: 220px; text-align: center; color: ${colors.textMuted}; }
  </style>
</head>
<body>
  <h1>TARTAR</h1>
  <div class="sub">${voucherTypeLabels[voucher.type]} Voucher</div>
  <table>
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td class="label">${escapeHtml(label)}</td><td class="value ${
            label === "Amount" ? "amount" : ""
          }">${escapeHtml(value)}</td></tr>`
      )
      .join("")}
  </table>
  <div class="sign">
    <div>Prepared by</div>
    <div>Approved by</div>
  </div>
  ${autoPrint}
</body>
</html>`
  );
};

export const printStatement = (
  customer: ICustomerLedgerKey,
  summary:
    | Pick<ICustomerReceivableSummary, "outstanding" | "unpaidCount">
    | undefined,
  rows: IReceivable[],
  payments: ILedgerPayment[],
  branchName: (slug: string) => string
): void => {
  const receivableRows = rows
    .map(
      (row) => `<tr>
        <td>${formatDate(row.created_at)}</td>
        <td>${formatDate(row.due_date)}</td>
        <td>${escapeHtml(branchName(row.branch))}</td>
        <td>${escapeHtml(row.reference_number ?? "—")}</td>
        <td class="num">${formatMoney(row.amount)}</td>
        <td class="num">${formatMoney(row.paid_amount)}</td>
        <td class="num">${formatMoney(ledgerBalance(row))}</td>
        <td>${ledgerStatusLabels[row.status]}</td>
      </tr>`
    )
    .join("");

  const statusLabels = paymentStatusLabels("receivable");
  const paymentRows = payments
    .map(
      (payment) => `<tr>
        <td>${formatDate(payment.paid_at)}</td>
        <td>${escapeHtml(payment.reference_number ?? "—")}</td>
        <td class="num">${formatMoney(payment.amount)}</td>
        <td>${statusLabels[payment.status]}</td>
      </tr>`
    )
    .join("");

  openDocument(
    840,
    1000,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Statement — ${escapeHtml(customer.customerName)}</title>
  <style>${baseStyles}
    h2 { margin: 28px 0 8px; font-size: 15px; }
    .sub { margin-bottom: 16px; }
    .meta { margin-bottom: 8px; }
    .meta strong { font-size: 17px; }
    table { font-size: 13px; }
    th { text-align: left; color: ${colors.textMuted}; font-weight: 600; }
    th, td { padding: 7px 8px; border-bottom: 1px solid ${colors.border}; }
    .outstanding { font-size: 18px; color: ${colors.brandDark}; font-weight: 700; }
  </style>
</head>
<body>
  <h1>TARTAR</h1>
  <div class="sub">Customer Statement · generated ${formatDateTime(
    new Date().toISOString()
  )}</div>
  <div class="meta"><strong>${escapeHtml(customer.customerName)}</strong></div>
  <div class="meta">Outstanding balance: <span class="outstanding">${formatMoney(
    summary?.outstanding ?? 0
  )}</span> · Unpaid transactions: ${summary?.unpaidCount ?? 0}</div>

  <h2>Receivables</h2>
  <table>
    <tr><th>Date</th><th>Due date</th><th>Branch</th><th>Reference</th>
        <th class="num">Amount</th><th class="num">Paid</th><th class="num">Balance</th><th>Status</th></tr>
    ${receivableRows || '<tr><td colspan="8">No receivable records</td></tr>'}
  </table>

  <h2>Payment history</h2>
  <table>
    <tr><th>Date</th><th>Reference</th><th class="num">Amount</th><th>Status</th></tr>
    ${paymentRows || '<tr><td colspan="4">No payments recorded</td></tr>'}
  </table>
  ${autoPrint}
</body>
</html>`
  );
};

export const printReport = (document_: IPrintReportDocument): void => {
  const renderTable = (table: IPrintTable): string => {
    const head = table.columns
      .map(
        (column) =>
          `<th class="${column.numeric ? "num" : ""}">${escapeHtml(
            column.title
          )}</th>`
      )
      .join("");

    const highlight = new Set(table.highlightRows ?? []);
    const body = table.rows
      .map(
        (row, index) =>
          `<tr class="${highlight.has(index) ? "flag" : ""}">${row
            .map(
              (cell, column) =>
                `<td class="${
                  table.columns[column]?.numeric ? "num" : ""
                }">${escapeHtml(cell)}</td>`
            )
            .join("")}</tr>`
      )
      .join("");

    return `<section>
    <h2>${escapeHtml(table.title)}</h2>
    ${
      table.subtitle
        ? `<div class="sub small">${escapeHtml(table.subtitle)}</div>`
        : ""
    }
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>
        ${
          body ||
          `<tr><td colspan="${table.columns.length}">${escapeHtml(
            table.emptyText ?? "No records"
          )}</td></tr>`
        }
      </tbody>
    </table>
  </section>`;
  };

  const stats = (document_.stats ?? [])
    .map(
      (stat) =>
        `<div class="stat"><div class="stat-label">${escapeHtml(
          stat.label
        )}</div><div class="stat-value">${escapeHtml(stat.value)}</div></div>`
    )
    .join("");

  openDocument(
    960,
    1000,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(document_.title)} — TARTAR</title>
  <style>@page { margin: 14mm; }${baseStyles}
    body { padding: 32px; }
    h2 { margin: 26px 0 8px; font-size: 15px; }
    .small { font-size: 12px; }
    .stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0 4px; }
    .stat { border: 1px solid ${colors.border}; border-radius: 6px; padding: 10px 16px; min-width: 150px; }
    .stat-label { color: ${colors.textMuted}; font-size: 12px; }
    .stat-value { color: ${colors.brandDark}; font-size: 18px; font-weight: 700; }
    table { font-size: 13px; }
    th { text-align: left; color: ${colors.textMuted}; font-weight: 600; }
    th, td { padding: 7px 8px; border-bottom: 1px solid ${colors.border}; }
    tr.flag td { color: ${colors.danger}; font-weight: 600; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    .foot { margin-top: 28px; color: ${colors.textMuted}; font-size: 11px; }
  </style>
</head>
<body>
  <h1>TARTAR</h1>
  <div class="sub">${escapeHtml(document_.title)} · ${escapeHtml(
      document_.period
    )} · ${escapeHtml(document_.scope)}</div>
  ${stats ? `<div class="stats">${stats}</div>` : ""}
  ${document_.tables.map(renderTable).join("")}
  <div class="foot">Generated ${formatDateTime(new Date().toISOString())}</div>
  ${autoPrint}
</body>
</html>`
  );
};
