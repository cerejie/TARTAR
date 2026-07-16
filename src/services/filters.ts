/**
 * Shared search/filter shape (build spec §15 — searchable by Customer, Supplier,
 * Reference Number, Date, Amount). Any list service accepts a subset of these
 * and applies them uniformly via `applyLedgerFilters`, keeping filtering DRY.
 */
export interface LedgerFilters {
  branch?: string
  farmSection?: string
  dateFrom?: string // inclusive ISO date
  dateTo?: string // inclusive ISO date
  amountMin?: number
  amountMax?: number
  referenceNumber?: string
  customerId?: string
  supplierId?: string
}

/**
 * Minimal structural view of a PostgREST query builder — just the chainable
 * comparison methods we use. Avoids importing supabase-js internal types while
 * preserving the caller's concrete builder type through the generic `T`.
 */
interface Chainable {
  eq: (column: string, value: unknown) => unknown
  gte: (column: string, value: unknown) => unknown
  lte: (column: string, value: unknown) => unknown
  ilike: (column: string, value: string) => unknown
}

/**
 * Apply the common filters to a query builder. `date`/`amount` column names
 * differ between tables (txn_date vs due_date), so they are passed in.
 */
export function applyLedgerFilters<T extends Chainable>(
  query: T,
  filters: LedgerFilters,
  columns: { date: string; amount?: string } = { date: 'txn_date', amount: 'amount' },
): T {
  let q = query
  const chain = (next: unknown) => {
    q = next as T
  }
  if (filters.branch) chain(q.eq('branch', filters.branch))
  if (filters.farmSection) chain(q.eq('farm_section', filters.farmSection))
  if (filters.customerId) chain(q.eq('customer_id', filters.customerId))
  if (filters.supplierId) chain(q.eq('supplier_id', filters.supplierId))
  if (filters.referenceNumber) {
    chain(q.ilike('reference_number', `%${filters.referenceNumber}%`))
  }
  if (filters.dateFrom) chain(q.gte(columns.date, filters.dateFrom))
  if (filters.dateTo) chain(q.lte(columns.date, filters.dateTo))
  if (columns.amount) {
    if (filters.amountMin != null) chain(q.gte(columns.amount, filters.amountMin))
    if (filters.amountMax != null) chain(q.lte(columns.amount, filters.amountMax))
  }
  return q
}
