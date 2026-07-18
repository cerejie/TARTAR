import type {
  CustomerLedgerKey,
  CustomerReceivableSummary,
  LedgerPayment,
  Receivable,
  Voucher,
} from '../models'
import { labels, paymentStatusLabels } from '../models'
import { formatDate, formatMoney, formatDateTime } from './format'
import { colors, fontBody } from '../styles/theme.css'

/**
 * Opens a print-ready window for an approved voucher (build spec §16). This is
 * a standalone generated document (not part of the antd app UI), so it carries
 * its own <style> — the "no inline styles" rule governs the app, not print docs.
 */
export function printVoucher(v: Voucher, branchName: string): void {
  const win = window.open('', '_blank', 'width=720,height=900')
  if (!win) return

  const rows: [string, string][] = [
    ['Voucher No.', v.voucher_no ?? '—'],
    ['Type', labels.voucherType[v.type]],
    ['Branch', branchName],
    ['Payee', v.payee],
    ['Amount', formatMoney(v.amount)],
    ['Purpose', v.purpose ?? '—'],
    ['Status', labels.voucherStatus[v.status]],
    ['Approved at', formatDateTime(v.approved_at)],
  ]

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Voucher ${v.voucher_no ?? ''}</title>
  <style>
    body { font-family: ${fontBody}; color: ${colors.text}; padding: 40px; }
    h1 { color: ${colors.brandDark}; letter-spacing: .08em; margin: 0 0 4px; }
    .sub { color: ${colors.textMuted}; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
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
  <div class="sub">${labels.voucherType[v.type]} Voucher</div>
  <table>
    ${rows
      .map(
        ([k, val]) =>
          `<tr><td class="label">${k}</td><td class="value ${k === 'Amount' ? 'amount' : ''}">${val}</td></tr>`,
      )
      .join('')}
  </table>
  <div class="sign">
    <div>Prepared by</div>
    <div>Approved by</div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`)
  win.document.close()
}

/**
 * Printable Customer Statement (client decision 8): customer info, receivable
 * history, outstanding balance and payment history. Same standalone-document
 * approach as `printVoucher`.
 */
export function printStatement(
  customer: CustomerLedgerKey,
  summary: Pick<CustomerReceivableSummary, 'outstanding' | 'unpaidCount'> | undefined,
  rows: Receivable[],
  payments: LedgerPayment[],
  branchName: (slug: string) => string,
): void {
  const win = window.open('', '_blank', 'width=840,height=1000')
  if (!win) return

  const receivableRows = rows
    .map(
      (r) => `<tr>
        <td>${formatDate(r.created_at)}</td>
        <td>${formatDate(r.due_date)}</td>
        <td>${branchName(r.branch)}</td>
        <td>${r.reference_number ?? '—'}</td>
        <td class="num">${formatMoney(r.amount)}</td>
        <td class="num">${formatMoney(r.paid_amount)}</td>
        <td class="num">${formatMoney(Number(r.amount) - Number(r.paid_amount))}</td>
        <td>${labels.ledgerStatus[r.status]}</td>
      </tr>`,
    )
    .join('')

  const statusLabels = paymentStatusLabels('receivable')
  const paymentRows = payments
    .map(
      (p) => `<tr>
        <td>${formatDate(p.paid_at)}</td>
        <td>${p.reference_number ?? '—'}</td>
        <td class="num">${formatMoney(p.amount)}</td>
        <td>${statusLabels[p.status]}</td>
      </tr>`,
    )
    .join('')

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Statement — ${customer.customerName}</title>
  <style>
    body { font-family: ${fontBody}; color: ${colors.text}; padding: 40px; }
    h1 { color: ${colors.brandDark}; letter-spacing: .08em; margin: 0 0 4px; }
    h2 { margin: 28px 0 8px; font-size: 15px; }
    .sub { color: ${colors.textMuted}; margin-bottom: 16px; }
    .meta { margin-bottom: 8px; }
    .meta strong { font-size: 17px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; color: ${colors.textMuted}; font-weight: 600; }
    th, td { padding: 7px 8px; border-bottom: 1px solid ${colors.border}; }
    td.num, th.num { text-align: right; }
    .outstanding { font-size: 18px; color: ${colors.brandDark}; font-weight: 700; }
  </style>
</head>
<body>
  <h1>TARTAR</h1>
  <div class="sub">Customer Statement · generated ${formatDateTime(new Date().toISOString())}</div>
  <div class="meta"><strong>${customer.customerName}</strong></div>
  <div class="meta">Outstanding balance: <span class="outstanding">${formatMoney(summary?.outstanding ?? 0)}</span>
    · Unpaid transactions: ${summary?.unpaidCount ?? 0}</div>

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
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`)
  win.document.close()
}
