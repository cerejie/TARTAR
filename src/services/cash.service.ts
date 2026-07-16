import { supabase, toError } from './supabase'
import type { CashAccountBalance } from '../models'

/**
 * Cash management (build spec §10). Balances for Cash Drawer + Bank Account per
 * branch. Read-only here — balances are maintained server-side (managers only,
 * per RLS). Financial standing is visible to managers only.
 */
export async function listCashBalances(branch?: string): Promise<CashAccountBalance[]> {
  let query = supabase.from('cash_accounts').select('branch, account, balance, updated_at')
  if (branch) query = query.eq('branch', branch)
  const { data, error } = await query
  if (error) throw toError(error)
  return (data ?? []) as CashAccountBalance[]
}
