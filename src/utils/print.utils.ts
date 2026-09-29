import {
  ledgerStatusLabels,
  payableStatusLabels,
  type PaymentKind,
} from "../enums/ledger.enum";
import { voucherTypeLabels } from "../enums/voucher.enum";
import type {
  ICustomerReceivableSummary,
  IPayable,
  IReceivable,
} from "../models/data/ledger/ledger.response";
import {
  ledgerBalance,
  payableStatusOf,
} from "../models/data/ledger/ledger.response";
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

const voucherBreakdownRows = (voucher: IVoucher): [string, string][] => {
  const totals = voucherTotalsOf(voucher);
  const rate = Number(voucher.ewt_rate);
  const withholdLabel = rate > 0 ? `${rate * 100}% withhold` : "Withhold";
  const moneyOrBlank = (value: number | undefined) =>
    value ? formatMoney(value) : "";

  return [
    ["Gross Total", formatMoney(totals?.invoice ?? voucher.amount)],
    ["12% vat", moneyOrBlank(totals?.amountBeforeVat)],
    [withholdLabel, moneyOrBlank(totals?.ewt)],
    ["TOTAL", formatMoney(totals?.invoice ?? voucher.amount)],
    ["Less return", moneyOrBlank(totals?.lessReturn)],
  ];
};

const voucherGridRow = (cells: readonly [string, string][]): string =>
  `<tr>${cells
    .map(
      ([label, value]) =>
        `<td><span class="cap">${label}</span> ${escapeHtml(value)}</td>`
    )
    .join("")}</tr>`;

export const printVoucher = (
  voucher: IVoucher,
  letterhead: IPrintLetterhead
): void => {
  const title = `${voucherTypeLabels[voucher.type]} Voucher`.toUpperCase();
  const particulars = voucher.particulars || voucherPurpose(voucher);
  const isCheck = voucher.type === "check";
  const breakdown = voucherBreakdownRows(voucher)
    .map(
      ([label, value]) =>
        `<tr><td class="line-label">${escapeHtml(
          label
        )}</td><td class="num">${value}</td></tr>`
    )
    .join("");
  const signatories: [string, string][] = [
    ["Prepared by", voucher.prepared_by_name ?? ""],
    ["Approved by", voucher.approved_by_name ?? ""],
  ];

  openDocument(
    820,
    960,
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voucher ${escapeHtml(voucher.voucher_no ?? "")}</title>
  <style>${baseStyles}
    .sheet { border: 1px solid ${printPalette.text}; }
    .head { text-align: center; border-bottom: 1px solid ${printPalette.text}; padding: 6px 0; }
    .head h1 { font-size: 22px; letter-spacing: .02em; }
    .head .sub { color: ${printPalette.text}; }
    .title { display: flex; justify-content: space-between; align-items: stretch; border-bottom: 1px solid ${printPalette.text}; }
    .title h2 { margin: 0; padding: 6px 12px; font-size: 16px; letter-spacing: .04em; }
    .meta { border-collapse: collapse; width: auto; }
    .meta td { padding: 3px 10px; font-weight: 700; text-align: right; }
    .meta td.value { font-weight: 400; min-width: 200px; border-left: 1px solid ${printPalette.text}; border-bottom: 1px solid ${printPalette.text}; }
    .payee { padding: 28px 12px 12px; font-size: 30px; font-weight: 800; border-bottom: 1px solid ${printPalette.text}; }
    table.body td, table.body th { border: 1px solid ${printPalette.text}; }
    table.body th { font-size: 20px; padding: 4px; text-align: center; }
    table.body td.particulars { padding: 0; vertical-align: top; width: 66%; }
    .purpose { text-align: center; padding: 36px 12px; text-transform: uppercase; letter-spacing: .04em; }
    table.lines td { padding: 1px 8px; border-top: 1px solid ${printPalette.text}; }
    table.lines td.line-label { text-align: right; font-weight: 700; width: 50%; border-right: 1px solid ${printPalette.text}; }
    table.body td.net { text-align: center; font-size: 34px; font-weight: 800; vertical-align: middle; }
    table.grid td { border: 1px solid ${printPalette.text}; padding: 8px; width: 33%; vertical-align: top; }
    table.grid .cap { color: ${printPalette.text}; }
    .received { padding: 10px 8px 2px; }
    .sign { margin-top: 56px; display: flex; justify-content: space-between; }
    .sign div { width: 220px; text-align: center; }
    .sign .name { font-weight: 600; min-height: 20px; }
    .sign .role { border-top: 1px solid ${printPalette.text}; padding-top: 6px; color: ${printPalette.muted}; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <h1>${escapeHtml(letterhead.name)}</h1>
      ${letterhead.address ? `<div class="sub">${escapeHtml(letterhead.address)}</div>` : ""}
    </div>
    <div class="title">
      <h2>${title}</h2>
      <table class="meta">
        <tr><td>Voucher No.:</td><td class="value">${escapeHtml(voucher.voucher_no ?? "")}</td></tr>
        <tr><td>Date:</td><td class="value">${formatDate(voucher.created_at)}</td></tr>
      </table>
    </div>
    <div class="payee">${escapeHtml(voucher.payee)}</div>
    <table class="body">
      <tr><th>PARTICULARS</th><th>Amount</th></tr>
      <tr>
        <td class="particulars">
          <div class="purpose">${escapeHtml(particulars)}</div>
          <table class="lines">${breakdown}</table>
        </td>
        <td class="net">${formatMoney(voucher.amount)}</td>
      </tr>
    </table>
    <table class="grid">${voucherGridRow([
      ["Bank Name:", isCheck ? voucher.check_bank ?? "" : ""],
      ["Check No.:", isCheck ? voucher.check_number ?? "" : ""],
      [
        "Date of Check:",
        isCheck && voucher.check_due_date ? formatDate(voucher.check_due_date) : "",
      ],
    ])}</table>
    <div class="received cap">Received By:</div>
    <table class="grid">${voucherGridRow([
      ["Name:", ""],
      ["Signature:", ""],
      ["Date:", ""],
    ])}</table>
  </div>
  <div class="sign">${signatories
    .map(
      ([role, name]) =>
        `<div><div class="name">${escapeHtml(name)}</div><div class="role">${role}</div></div>`
    )
    .join("")}</div>
  ${autoPrint}
</body>
</html>`
  );
};

const statementLabels: Record<
  PaymentKind,
  { title: string; section: string; empty: string }
> = {
  receivable: {
    title: "Customer Statement",
    section: "Receivables",
    empty: "No receivable records",
  },
  payable: {
    title: "Supplier Statement",
    section: "Payables",
    empty: "No payable records",
  },
};

const statementStatusOf = (
  kind: PaymentKind,
  row: IReceivable | IPayable
): string =>
  kind === "payable"
    ? payableStatusLabels[payableStatusOf(row)]
    : ledgerStatusLabels[row.status];

export const printStatement = (
  kind: PaymentKind,
  partyName: string,
  summary:
    | Pick<ICustomerReceivableSummary, "outstanding" | "unpaidCount">
    | undefined,
  rows: readonly (IReceivable | IPayable)[],
  payments: ILedgerPayment[],
  branchName: (slug: string) => string
): void => {
  const labels = statementLabels[kind];
  const ledgerRows = rows
    .map(
      (row) => `<tr>
        <td>${formatDate(row.created_at)}</td>
        <td>${formatDate(row.due_date)}</td>
        <td>${escapeHtml(branchName(row.branch))}</td>
        <td>${escapeHtml(row.reference_number ?? "—")}</td>
        <td class="num">${formatMoney(row.amount)}</td>
        <td class="num">${formatMoney(row.paid_amount)}</td>
        <td class="num">${formatMoney(ledgerBalance(row))}</td>
        <td>${statementStatusOf(kind, row)}</td>
      </tr>`
    )
    .join("");

  const paymentRows = payments
    .map(
      (payment) => `<tr>
        <td>${formatDate(payment.paid_at)}</td>
        <td>${escapeHtml(payment.reference_number ?? "—")}</td>
        <td class="num">${formatMoney(payment.amount)}</td>
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
  <title>Statement — ${escapeHtml(partyName)}</title>
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
  <div class="sub">${labels.title} · generated ${formatDateTime(
    new Date().toISOString()
  )}</div>
  <div class="meta"><strong>${escapeHtml(partyName)}</strong></div>
  <div class="meta">Outstanding balance: <span class="outstanding">${formatMoney(
    summary?.outstanding ?? 0
  )}</span> · Unpaid transactions: ${summary?.unpaidCount ?? 0}</div>

  <h2>${labels.section}</h2>
  <table>
    <tr><th>Date</th><th>Due date</th><th>Branch</th><th>Reference</th>
        <th class="num">Amount</th><th class="num">Paid</th><th class="num">Balance</th><th>Status</th></tr>
    ${ledgerRows || `<tr><td colspan="8">${labels.empty}</td></tr>`}
  </table>

  <h2>Payment history</h2>
  <table>
    <tr><th>Date</th><th>Reference</th><th class="num">Amount</th></tr>
    ${paymentRows || '<tr><td colspan="3">No payments recorded</td></tr>'}
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
