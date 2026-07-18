import { z } from 'zod'

/**
 * Enumerations mirrored 1:1 from the Supabase schema (see
 * supabase/migrations/20260716000001_init.sql). Kept in one place so the DB,
 * zod schemas, and UI selectors never drift. Each `*Values` array is the single
 * source for antd <Select> options; the matching zod enum validates writes.
 */

// --- Roles (superadmin is NOT stored; it's the Supabase Auth session) --------
export const userRoleValues = ['admin', 'accountant', 'employee'] as const
export const userRoleSchema = z.enum(userRoleValues)
export type UserRole = z.infer<typeof userRoleSchema>

/** Effective role including the runtime-only superAdmin (never persisted). */
export type EffectiveRole = UserRole | 'superadmin'

export const approvalStatusValues = ['pending', 'approved', 'rejected'] as const
export const approvalStatusSchema = z.enum(approvalStatusValues)
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>

// --- Transactions ------------------------------------------------------------
export const transactionTypeValues = [
  'sale',
  'expense',
  'customer_payment',
  'supplier_payment',
  'cash_deposit',
  'petty_cash',
  'purchase',
  'collection',
] as const
export const transactionTypeSchema = z.enum(transactionTypeValues)
export type TransactionType = z.infer<typeof transactionTypeSchema>

export const incomeSourceValues = ['product_sales', 'rental_income'] as const
export const incomeSourceSchema = z.enum(incomeSourceValues)
export type IncomeSource = z.infer<typeof incomeSourceSchema>

export const expenseTypeValues = [
  'electricity',
  'water',
  'internet',
  'salaries',
  'office_supplies',
  'repairs_maintenance',
  'taxes',
] as const
export const expenseTypeSchema = z.enum(expenseTypeValues)
export type ExpenseType = z.infer<typeof expenseTypeSchema>

export const cashAccountValues = ['cash_drawer', 'bank_account'] as const
export const cashAccountSchema = z.enum(cashAccountValues)
export type CashAccount = z.infer<typeof cashAccountSchema>

// --- Vouchers ----------------------------------------------------------------
export const voucherTypeValues = ['check', 'cash'] as const
export const voucherTypeSchema = z.enum(voucherTypeValues)
export type VoucherType = z.infer<typeof voucherTypeSchema>

export const voucherStatusValues = ['pending', 'approved', 'rejected'] as const
export const voucherStatusSchema = z.enum(voucherStatusValues)
export type VoucherStatus = z.infer<typeof voucherStatusSchema>

/**
 * What a MANUAL voucher is for (client decision 2026-07-19). Replaces the old
 * free-text purpose: the creator picks expense or purchase, and an approved
 * purchase voucher becomes a payable (DB trigger, see the voucher_payables
 * migration). Auto-generated vouchers derive the same thing from their source
 * transaction, so this lives in the shared `category` code rather than a new
 * column.
 */
export const voucherKindValues = ['expense', 'purchase'] as const
export const voucherKindSchema = z.enum(voucherKindValues)
export type VoucherKind = z.infer<typeof voucherKindSchema>

/** Manual-voucher kind → numbering category code (see app.voucher_category). */
export const voucherKindCategory = {
  expense: 'EXP',
  purchase: 'PUR',
} as const satisfies Record<VoucherKind, string>

// --- Receivable / payable lifecycle -----------------------------------------
export const ledgerStatusValues = ['open', 'partial', 'paid'] as const
export const ledgerStatusSchema = z.enum(ledgerStatusValues)
export type LedgerStatus = z.infer<typeof ledgerStatusSchema>

// --- Ledger payments (verification workflow) ---------------------------------
export const paymentKindValues = ['receivable', 'payable'] as const
export const paymentKindSchema = z.enum(paymentKindValues)
export type PaymentKind = z.infer<typeof paymentKindSchema>

export const paymentStatusValues = ['pending', 'verified', 'rejected'] as const
export const paymentStatusSchema = z.enum(paymentStatusValues)
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

/**
 * Human-friendly labels for enum values. One map per enum keeps every UI label
 * consistent (tables, selects, tags) without scattering switch statements.
 */
export const labels = {
  userRole: {
    admin: 'Admin',
    accountant: 'Accountant',
    employee: 'Employee',
  } satisfies Record<UserRole, string>,
  approvalStatus: {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  } satisfies Record<ApprovalStatus, string>,
  transactionType: {
    sale: 'Sale',
    expense: 'Expense',
    customer_payment: 'Customer Payment',
    supplier_payment: 'Supplier Payment',
    cash_deposit: 'Cash Deposit',
    petty_cash: 'Petty Cash',
    purchase: 'Purchase',
    collection: 'Collection',
  } satisfies Record<TransactionType, string>,
  incomeSource: {
    product_sales: 'Product Sales',
    rental_income: 'Rental Income',
  } satisfies Record<IncomeSource, string>,
  expenseType: {
    electricity: 'Electricity',
    water: 'Water',
    internet: 'Internet',
    salaries: 'Salaries',
    office_supplies: 'Office Supplies',
    repairs_maintenance: 'Repairs & Maintenance',
    taxes: 'Taxes',
  } satisfies Record<ExpenseType, string>,
  cashAccount: {
    cash_drawer: 'Cash Drawer',
    bank_account: 'Bank Account',
  } satisfies Record<CashAccount, string>,
  voucherType: {
    check: 'Check',
    cash: 'Cash',
  } satisfies Record<VoucherType, string>,
  voucherStatus: {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  } satisfies Record<VoucherStatus, string>,
  voucherKind: {
    expense: 'Expense',
    purchase: 'Purchase',
  } satisfies Record<VoucherKind, string>,
  ledgerStatus: {
    open: 'Open',
    partial: 'Partial',
    paid: 'Paid',
  } satisfies Record<LedgerStatus, string>,
  // Client terminology (2026-07): customer payments are VERIFIED, supplier
  // payments are APPROVED — same workflow, different label per side.
  receivablePaymentStatus: {
    pending: 'Pending verification',
    verified: 'Verified',
    rejected: 'Rejected',
  } satisfies Record<PaymentStatus, string>,
  payablePaymentStatus: {
    pending: 'Pending approval',
    verified: 'Approved',
    rejected: 'Rejected',
  } satisfies Record<PaymentStatus, string>,
} as const

/** Status labels for a payment, honoring the per-side terminology. */
export function paymentStatusLabels(kind: PaymentKind): Record<PaymentStatus, string> {
  return kind === 'receivable' ? labels.receivablePaymentStatus : labels.payablePaymentStatus
}

/**
 * Shared antd Tag colors per enum, mirroring `labels` — one source so every
 * page renders a given status identically.
 */
export const tagColors = {
  ledgerStatus: {
    open: 'default',
    partial: 'gold',
    paid: 'green',
  } satisfies Record<LedgerStatus, string>,
  voucherStatus: {
    pending: 'gold',
    approved: 'green',
    rejected: 'red',
  } satisfies Record<VoucherStatus, string>,
  paymentStatus: {
    pending: 'gold',
    verified: 'green',
    rejected: 'red',
  } satisfies Record<PaymentStatus, string>,
} as const

/** Build antd <Select> options ([{value,label}]) from a values array + label map. */
export function toOptions<T extends string>(
  values: readonly T[],
  labelMap: Record<T, string>,
): { value: T; label: string }[] {
  return values.map((value) => ({ value, label: labelMap[value] }))
}
