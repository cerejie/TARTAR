import {
  ledgerStatusLabels,
  paymentStatusLabels,
} from "../enums/ledger.enum";
import {
  voucherLineLabels,
  voucherLineValues,
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
import { printFont, printPalette } from "../styles/print/print.styles";
import { formatDate, formatDateTime, formatMoney } from "./format.utils";
import { voucherTotalsOf } from "./voucher.utils";

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
    body { font-family: ${printFont}; color: ${printPalette.text}; padding: 40px; }
    h1 { color: ${printPalette.heading}; letter-spacing: .08em; margin: 0 0 4px; }
    .sub { color: ${printPalette.muted}; }
    table { width: 100%; border-collapse: collapse; }
    td.num, th.num { text-align: right; }`;

const autoPrint = `<script>window.onload = function () { window.print(); };</script>`;

export interface IPrintLetterhead {
  name: string;
  address: string | null;
}

const voucherBreakdownRows = (voucher: IVoucher): string => {
  const totals = voucherTotalsOf(voucher);
  if (!totals) return "";

  return voucherLineValues
    .filter((line) => line !== "amountToPay")
    .map(
      (line) =>
        `<tr class="line"><td>${escapeHtml(
          voucherLineLabels[line]
        )}</td><td class="num">${formatMoney(totals[line])}</td></tr>`
    )
    .join("");
};

const voucherCheckBlock = (voucher: IVoucher): string => {
  if (voucher.type !== "check") return "";

  const cells: [string, string][] = [
    ["Bank name", voucher.check_bank ?? ""],
    ["Check No.", voucher.check_number ?? ""],
    [
      "Date of check",
      voucher.check_due_date ? formatDate(voucher.check_due_date) : "",
    ],
  ];

  return `<table class="grid"><tr>${cells
    .map(
      ([label, value]) =>
        `<td><div class="cap">${label}</div><div class="val">${escapeHtml(
          value
        )}</div></td>`
    )
    .join("")}</tr></table>`;
};

export const printVoucher = (
  voucher: IVoucher,
  letterhead: IPrintLetterhead
): void => {
  const title = `${voucherTypeLabels[voucher.type]} Voucher`.toUpperCase();
  const particulars = voucher.particulars || voucherPurpose(voucher);
  const receiptCaptions = ["Name", "Signature", "Date"] as const;

  openDocument(
    760,
    960,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voucher ${escapeHtml(voucher.voucher_no ?? "")}</title>
  <style>${baseStyles}
    .head { text-align: center; margin-bottom: 20px; }
    .head h1 { font-size: 18px; }
    .title { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid ${printPalette.heading}; padding-bottom: 8px; }
    .title h2 { margin: 0; color: ${printPalette.heading}; letter-spacing: .12em; font-size: 16px; }
    .meta { text-align: right; font-size: 13px; }
    .meta span { color: ${printPalette.muted}; margin-right: 8px; }
    .payee { padding: 12px 0; border-bottom: 1px solid ${printPalette.border}; }
    .cap { color: ${printPalette.muted}; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
    .val { font-weight: 600; min-height: 18px; }
    table.items { margin-top: 16px; }
    table.items th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: ${printPalette.muted}; border-bottom: 1px solid ${printPalette.border}; padding: 6px 8px; }
    table.items td { padding: 8px; vertical-align: top; }
    table.items tr.line td { padding: 4px 8px 4px 24px; color: ${printPalette.muted}; font-size: 13px; }
    table.items tr.total td { border-top: 2px solid ${printPalette.heading}; font-weight: 700; font-size: 16px; color: ${printPalette.heading}; }
    table.grid { margin-top: 24px; }
    table.grid td { border: 1px solid ${printPalette.border}; padding: 8px; width: 33%; vertical-align: top; }
    .receipt { margin-top: 24px; }
    .sign { margin-top: 56px; display: flex; justify-content: space-between; }
    .sign div { border-top: 1px solid ${printPalette.text}; padding-top: 6px; width: 200px; text-align: center; color: ${printPalette.muted}; }
  </style>
</head>
<body>
  <div class="head">
    <h1>${escapeHtml(letterhead.name)}</h1>
    ${letterhead.address ? `<div class="sub">${escapeHtml(letterhead.address)}</div>` : ""}
  </div>
  <div class="title">
    <h2>${title}</h2>
    <div class="meta">
      <div><span>Voucher No.</span>${escapeHtml(voucher.voucher_no ?? "—")}</div>
      <div><span>Date</span>${formatDate(voucher.created_at)}</div>
    </div>
  </div>
  <div class="payee">
    <div class="cap">Payee</div>
    <div class="val">${escapeHtml(voucher.payee)}</div>
  </div>
  <table class="items">
    <tr><th>Particulars</th><th class="num">Amount</th></tr>
    <tr><td>${escapeHtml(particulars)}</td><td></td></tr>
    ${voucherBreakdownRows(voucher)}
    <tr class="total"><td>${voucherLineLabels.amountToPay}</td><td class="num">${formatMoney(
      voucher.amount
    )}</td></tr>
  </table>
  ${voucherCheckBlock(voucher)}
  <div class="receipt">
    <div class="cap">Received by</div>
    <table class="grid"><tr>${receiptCaptions
      .map((caption) => `<td><div class="cap">${caption}</div><div class="val"></div></td>`)
      .join("")}</tr></table>
  </div>
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
    th { text-align: left; color: ${printPalette.muted}; font-weight: 600; }
    th, td { padding: 7px 8px; border-bottom: 1px solid ${printPalette.border}; }
    .outstanding { font-size: 18px; color: ${printPalette.heading}; font-weight: 700; }
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
    .stat { border: 1px solid ${printPalette.border}; border-radius: 6px; padding: 10px 16px; min-width: 150px; }
    .stat-label { color: ${printPalette.muted}; font-size: 12px; }
    .stat-value { color: ${printPalette.heading}; font-size: 18px; font-weight: 700; }
    table { font-size: 13px; }
    th { text-align: left; color: ${printPalette.muted}; font-weight: 600; }
    th, td { padding: 7px 8px; border-bottom: 1px solid ${printPalette.border}; }
    tr.flag td { color: ${printPalette.danger}; font-weight: 600; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    .foot { margin-top: 28px; color: ${printPalette.muted}; font-size: 11px; }
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
