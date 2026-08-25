import type {
  CashAccount,
  IncomeSource,
  TransactionType,
} from "../../../enums/transaction.enum";
import type { IVoucher } from "../voucher/voucher.response";

export interface ITransaction {
  id: string;
  type: TransactionType;
  branch: string;
  farm_section: string | null;
  txn_date: string;
  amount: number;
  reference_number: string | null;
  description: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  cash_account: CashAccount | null;
  income_source: IncomeSource | null;
  expense_type: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  customer?: { name: string } | null;
  supplier?: { name: string } | null;
}

export interface IDisbursement extends ITransaction {
  voucher: IVoucher | null;
}

export interface ITransactionAudit {
  id: string;
  transaction_id: string;
  edited_by: string | null;
  edited_at: string;
  changes: Record<string, { old: unknown; new: unknown }>;
}
