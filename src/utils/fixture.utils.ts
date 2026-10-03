import type { IExpenseCategory } from "../models/data/expense-category/expense.category.response";
import type { IPayable } from "../models/data/ledger/ledger.response";
import {
  blankTransactionFields,
  type IDisbursement,
} from "../models/data/transaction/transaction.response";
import type { IVoucher } from "../models/data/voucher/voucher.response";

const fixtureTimestamp = "2026-01-15T08:00:00.000Z";
const fixtureDate = "2026-01-15";

export const voucherFixture = (values: Partial<IVoucher> = {}): IVoucher => ({
  id: "voucher-1",
  voucher_no: null,
  type: "cash",
  branch: "main",
  payee: "Payee",
  amount: 0,
  purpose: null,
  status: "approved",
  printed: false,
  created_by: null,
  approved_by: null,
  approved_at: null,
  created_at: fixtureTimestamp,
  transaction_id: null,
  supplier_id: null,
  category: "EXP",
  due_date: null,
  payable_id: null,
  check_bank: null,
  check_number: null,
  check_due_date: null,
  particulars: null,
  gross_amount: null,
  ewt_rate: 0,
  ewt_amount: 0,
  less_return: 0,
  vatable: false,
  ...values,
});

export const disbursementFixture = (
  values: Partial<IDisbursement> = {}
): IDisbursement => ({
  ...blankTransactionFields,
  id: "transaction-1",
  type: "expense",
  branch: "main",
  txn_date: fixtureDate,
  amount: 0,
  created_at: fixtureTimestamp,
  voucher: null,
  ...values,
});

export const expenseCategoryFixture = (
  values: Partial<IExpenseCategory> = {}
): IExpenseCategory => ({
  slug: "fuel",
  name: "Fuel",
  code: "FUEL",
  sort: 0,
  active: true,
  created_at: fixtureTimestamp,
  ...values,
});

export const payableFixture = (values: Partial<IPayable> = {}): IPayable => ({
  id: "payable-1",
  branch: "main",
  amount: 0,
  paid_amount: 0,
  due_date: fixtureDate,
  reference_number: null,
  status: "open",
  created_by: null,
  created_at: fixtureTimestamp,
  supplier_id: null,
  supplier_name: "Supplier",
  ...values,
});
