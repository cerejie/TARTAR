import type { SaleStatus } from "../../../enums/sale.enum";
import type { ITransaction } from "../transaction/transaction.response";

export interface ISale extends ITransaction {
  sale_status: SaleStatus;
  deposit_date: string | null;
  deposited_by: string | null;
  deposited_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
}

export interface ISaleSummary {
  verified: number;
  pendingVerification: number;
  undeposited: number;
  rejected: number;
}
