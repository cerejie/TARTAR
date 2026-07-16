import type { Voucher } from '../models'
import { labels } from '../models'
import { formatMoney, formatDateTime } from './format'

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
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f1f1f; padding: 40px; }
    h1 { color: #c1121f; letter-spacing: .08em; margin: 0 0 4px; }
    .sub { color: #6b7280; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    td.label { color: #6b7280; width: 180px; }
    td.value { font-weight: 600; }
    .amount { font-size: 20px; color: #c1121f; }
    .sign { margin-top: 64px; display: flex; justify-content: space-between; }
    .sign div { border-top: 1px solid #1f1f1f; padding-top: 6px; width: 220px; text-align: center; color: #6b7280; }
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
