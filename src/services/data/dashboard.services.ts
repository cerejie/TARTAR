import dayjs from "dayjs";
import {
  cashInflowTypes,
  cashOutflowTypes,
} from "../../enums/transaction.enum";
import type { TransactionType } from "../../enums/transaction.enum";
import type { IBranch } from "../../models/data/branch/branch.response";
import type {
  DuePayableSource,
  IBranchMonitorRow,
  IDailySalesPoint,
  IDashboardOverview,
  IDashboardSummary,
  IDueAlerts,
  IDuePayable,
  IPaymentAccountRef,
  IPendingReviews,
  OverviewPeriod,
  SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import type {
  IPayable,
  IReceivable,
} from "../../models/data/ledger/ledger.response";
import {
  sumCountedPayments,
  type ILedgerPayment,
} from "../../models/data/payment/payment.response";
import {
  isPendingSale,
  isVerifiedSale,
} from "../../models/data/sale/sale.response";
import {
  sumCounted,
  type ITransaction,
} from "../../models/data/transaction/transaction.response";
import type { IVoucher } from "../../models/data/voucher/voucher.response";
import { scopeToBranch } from "../../utils/filter.utils";
import { todayIso } from "../../utils/format.utils";
import { everyRow, everyRowIn } from "../../utils/page.utils";
import { supabase } from "../../utils/supabase.utils";

type AmountRow = { amount: number | string };

type PayableVoucherRow = Pick<
  IVoucher,
  "payable_id" | "transaction_id" | "category" | "check_bank"
>;

type PayableTransactionRow = Pick<ITransaction, "id" | "type"> &
  IPaymentAccountRef;

const duePayableSources: Partial<Record<TransactionType, DuePayableSource>> = {
  purchase: "purchase",
  expense: "expense",
};

const plainDuePayable = (payable: IPayable): IDuePayable => ({
  ...payable,
  source: null,
  payment: null,
  check_bank: null,
});

const toDuePayables = async (payables: IPayable[]): Promise<IDuePayable[]> => {
  if (payables.length === 0) return [];

  const voucherRows = await everyRowIn<PayableVoucherRow>(
    payables.map((payable) => payable.id),
    (ids) =>
      supabase
        .from("vouchers")
        .select("payable_id, transaction_id, category, check_bank")
        .in("payable_id", ids)
  );
  const transactionIds = voucherRows.flatMap((voucher) =>
    voucher.transaction_id ? [voucher.transaction_id] : []
  );

  const transactions = await everyRowIn<PayableTransactionRow>(
    transactionIds,
    (ids) =>
      supabase
        .from("transactions")
        .select("id, type, cash_account, bank_account_id")
        .in("id", ids)
  );

  const transactionById = new Map(transactions.map((row) => [row.id, row]));
  const voucherByPayable = new Map(
    voucherRows.map((voucher) => [voucher.payable_id, voucher])
  );

  return payables.map((payable) => {
    const voucher = voucherByPayable.get(payable.id);
    if (!voucher) return plainDuePayable(payable);

    const transaction = voucher.transaction_id
      ? transactionById.get(voucher.transaction_id)
      : undefined;
    const manualSource = voucher.category === "PUR" ? "purchase" : null;

    return {
      ...payable,
      source: transaction
        ? duePayableSources[transaction.type] ?? null
        : manualSource,
      payment: transaction
        ? {
            cash_account: transaction.cash_account,
            bank_account_id: transaction.bank_account_id,
          }
        : null,
      check_bank: voucher.check_bank,
    };
  });
};
type TypedAmountRow = AmountRow & Pick<ITransaction, "type" | "sale_status">;
type BranchAmountRow = AmountRow & { branch: string };

type CountedVoucher = Pick<IVoucher, "status" | "amount">;

type CountedTransactionRow = TypedAmountRow & {
  vouchers: CountedVoucher | CountedVoucher[] | null;
};

type DatedCountedRow = CountedTransactionRow & { txn_date: string };
type BranchCountedRow = CountedTransactionRow & { branch: string };

const countedColumns = "type, sale_status, amount, vouchers(status, amount)";

const voucherOf = (vouchers: CountedTransactionRow["vouchers"]) =>
  Array.isArray(vouchers) ? vouchers[0] ?? null : vouchers;

const sumCountedRows = (rows: readonly CountedTransactionRow[]) =>
  sumCounted(
    rows.map((row) => ({
      type: row.type,
      sale_status: row.sale_status,
      amount: Number(row.amount),
      voucher: voucherOf(row.vouchers),
    }))
  );
type OutstandingRow = { amount: number | string; paid_amount: number | string };
type BranchOutstandingRow = OutstandingRow & { branch: string };

const customerPaymentsBetween = (
  from: string,
  to: string,
  branch?: string | null
) =>
  everyRow<Pick<ILedgerPayment, "status" | "amount">>(() =>
    scopeToBranch(
      supabase
        .from("payments")
        .select("status, amount")
        .eq("kind", "receivable")
        .gte("paid_at", from)
        .lte("paid_at", to),
      branch
    )
  );

const monthStart = () => dayjs().startOf("month").format("YYYY-MM-DD");

const sum = (rows: AmountRow[]) =>
  rows.reduce((total, row) => total + Number(row.amount), 0);

const outstanding = (rows: OutstandingRow[]) =>
  rows.reduce(
    (total, row) => total + (Number(row.amount) - Number(row.paid_amount)),
    0
  );

const salesPeriodConfig: Record<
  SalesPeriod,
  { unit: dayjs.ManipulateType; count: number }
> = {
  daily: { unit: "day", count: 30 },
  weekly: { unit: "week", count: 12 },
  monthly: { unit: "month", count: 12 },
  yearly: { unit: "year", count: 5 },
};

const overviewPeriodUnits: Record<
  Exclude<OverviewPeriod, "all">,
  dayjs.OpUnitType
> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

const overviewPeriodStart = (period: OverviewPeriod) =>
  period === "all" ? null : dayjs().startOf(overviewPeriodUnits[period]);

const unpaidRowsOf = (
  table: "receivables" | "payables",
  branch?: string | null
): Promise<OutstandingRow[]> =>
  everyRow<OutstandingRow>(() =>
    scopeToBranch(
      supabase.from(table).select("amount, paid_amount").neq("status", "paid"),
      branch
    )
  );

const outstandingOf = async (
  table: "receivables" | "payables",
  branch?: string | null
): Promise<number> => outstanding(await unpaidRowsOf(table, branch));

const createdSince = async (
  table: "receivables" | "payables",
  start: dayjs.Dayjs | null,
  branch?: string | null
): Promise<number> => {
  if (!start) return 0;
  const createdFrom = start.toISOString();

  return sum(
    await everyRow<AmountRow>(() =>
      scopeToBranch(
        supabase.from(table).select("amount").gte("created_at", createdFrom),
        branch
      )
    )
  );
};

const dashboardServices = {
  getSummary: async (branch?: string | null): Promise<IDashboardSummary> => {
    const today = todayIso();
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    const monthFrom = monthStart();

    const [
      recentRows,
      thisMonthRows,
      thisMonthCustomerPayments,
      accountsReceivable,
      accountsPayable,
    ] = await Promise.all([
      everyRow<DatedCountedRow>(() =>
        scopeToBranch(
          supabase
            .from("transactions")
            .select(`${countedColumns}, txn_date`)
            .in("type", ["sale", "expense"])
            .gte("txn_date", yesterday)
            .lte("txn_date", today),
          branch
        )
      ),
      everyRow<CountedTransactionRow>(() =>
        scopeToBranch(
          supabase
            .from("transactions")
            .select(countedColumns)
            .gte("txn_date", monthFrom)
            .lte("txn_date", today),
          branch
        )
      ),
      customerPaymentsBetween(monthFrom, today, branch),
      outstandingOf("receivables", branch),
      outstandingOf("payables", branch),
    ]);

    const isExpense = (row: TypedAmountRow) => row.type === "expense";
    const onDay = (date: string, predicate: (row: TypedAmountRow) => boolean) =>
      sumCountedRows(
        recentRows.filter((row) => row.txn_date === date && predicate(row))
      );

    const matching = (
      rows: CountedTransactionRow[],
      predicate: (row: TypedAmountRow) => boolean
    ) => sum(rows.filter(predicate));
    const ofDirection = (rows: CountedTransactionRow[], types: string[]) =>
      sumCountedRows(rows.filter((row) => types.includes(row.type)));

    return {
      todaysSales: onDay(today, isVerifiedSale),
      todaysExpenses: onDay(today, isExpense),
      yesterdaysSales: onDay(yesterday, isVerifiedSale),
      yesterdaysExpenses: onDay(yesterday, isExpense),
      accountsReceivable,
      accountsPayable,
      monthlySales: sumCountedRows(thisMonthRows.filter(isVerifiedSale)),
      monthlyPendingSales: matching(thisMonthRows, isPendingSale),
      monthlyExpenses: sumCountedRows(thisMonthRows.filter(isExpense)),
      monthlyCashIn:
        ofDirection(thisMonthRows, cashInflowTypes) +
        sumCountedPayments(thisMonthCustomerPayments),
      monthlyCashOut: ofDirection(thisMonthRows, cashOutflowTypes),
    };
  },

  getOverview: async (
    period: OverviewPeriod,
    branch?: string | null
  ): Promise<IDashboardOverview> => {
    const start = overviewPeriodStart(period);
    const today = todayIso();
    const salesAndExpenses = () => {
      const upToToday = supabase
        .from("transactions")
        .select(countedColumns)
        .in("type", ["sale", "expense"])
        .lte("txn_date", today);

      return scopeToBranch(
        start
          ? upToToday.gte("txn_date", start.format("YYYY-MM-DD"))
          : upToToday,
        branch
      );
    };

    const [rows, arOutstanding, arNew, apOutstanding, apNew] =
      await Promise.all([
        everyRow<CountedTransactionRow>(salesAndExpenses),
        outstandingOf("receivables", branch),
        createdSince("receivables", start, branch),
        outstandingOf("payables", branch),
        createdSince("payables", start, branch),
      ]);

    return {
      sales: sumCountedRows(rows.filter(isVerifiedSale)),
      expenses: sumCountedRows(rows.filter((row) => row.type === "expense")),
      arOutstanding,
      arNew,
      apOutstanding,
      apNew,
    };
  },

  getSalesSeries: async (
    period: SalesPeriod,
    branch?: string | null
  ): Promise<IDailySalesPoint[]> => {
    const { unit, count } = salesPeriodConfig[period];
    const from = dayjs()
      .subtract(count - 1, unit)
      .startOf(unit);

    const rows = await everyRow<AmountRow & { txn_date: string }>(() =>
      scopeToBranch(
        supabase
          .from("transactions")
          .select("txn_date, amount")
          .eq("type", "sale")
          .eq("sale_status", "verified")
          .gte("txn_date", from.format("YYYY-MM-DD")),
        branch
      )
    );

    const byBucket = new Map<string, number>();
    for (const row of rows) {
      const key = dayjs(row.txn_date).startOf(unit).format("YYYY-MM-DD");
      byBucket.set(key, (byBucket.get(key) ?? 0) + Number(row.amount));
    }

    const series: IDailySalesPoint[] = [];
    for (let index = 0; index < count; index += 1) {
      const key = from.add(index, unit).format("YYYY-MM-DD");
      series.push({ date: key, total: byBucket.get(key) ?? 0 });
    }

    return series;
  },

  getBranchMonitor: async (
    branches: IBranch[]
  ): Promise<IBranchMonitorRow[]> => {
    const unpaidByBranch = (table: "receivables" | "payables") =>
      everyRow<BranchOutstandingRow>(() =>
        supabase
          .from(table)
          .select("branch, amount, paid_amount")
          .neq("status", "paid")
      );

    const [sales, expenses, receivables, payables] = await Promise.all([
      everyRow<BranchAmountRow>(() =>
        supabase
          .from("transactions")
          .select("branch, amount")
          .eq("type", "sale")
          .eq("sale_status", "verified")
      ),
      everyRow<BranchCountedRow>(() =>
        supabase
          .from("transactions")
          .select(`branch, ${countedColumns}`)
          .eq("type", "expense")
      ),
      unpaidByBranch("receivables"),
      unpaidByBranch("payables"),
    ]);

    const ofBranch = <Row extends { branch: string }>(
      rows: readonly Row[],
      branch: string
    ) => rows.filter((row) => row.branch === branch);

    return branches.map((branch) => ({
      branch: branch.slug,
      branchName: branch.name,
      sales: sum(ofBranch(sales, branch.slug)),
      expenses: sumCountedRows(ofBranch(expenses, branch.slug)),
      receivables: outstanding(ofBranch(receivables, branch.slug)),
      payables: outstanding(ofBranch(payables, branch.slug)),
    }));
  },

  getDueAlerts: async (
    nearDays = 7,
    branch?: string | null
  ): Promise<IDueAlerts> => {
    const today = todayIso();
    const horizon = dayjs().add(nearDays, "day").format("YYYY-MM-DD");

    const dueRowsOf = <Row>(table: "receivables" | "payables") =>
      everyRow<Row>(() =>
        scopeToBranch(
          supabase
            .from(table)
            .select("*")
            .neq("status", "paid")
            .lte("due_date", horizon),
          branch
        )
      );

    const [receivableRows, payables] = await Promise.all([
      dueRowsOf<IReceivable>("receivables"),
      dueRowsOf<IPayable>("payables"),
    ]);
    const payableRows = await toDuePayables(payables);
    const isOverdue = (dueDate: string) => dueDate < today;

    return {
      overdueReceivables: receivableRows.filter((row) =>
        isOverdue(row.due_date)
      ),
      nearDueReceivables: receivableRows.filter(
        (row) => !isOverdue(row.due_date)
      ),
      overduePayables: payableRows.filter((row) => isOverdue(row.due_date)),
      nearDuePayables: payableRows.filter((row) => !isOverdue(row.due_date)),
    };
  },

  getPendingReviews: async (
    branch?: string | null
  ): Promise<IPendingReviews> => {
    const [vouchers, sales] = await Promise.all([
      everyRow<AmountRow>(() =>
        scopeToBranch(
          supabase.from("vouchers").select("amount").eq("status", "pending"),
          branch
        )
      ),
      everyRow<AmountRow>(() =>
        scopeToBranch(
          supabase
            .from("transactions")
            .select("amount")
            .eq("type", "sale")
            .eq("sale_status", "deposited"),
          branch
        )
      ),
    ]);

    const amountsOf = (rows: readonly AmountRow[]) =>
      rows.map((row) => Number(row.amount));

    return {
      pendingVouchers: amountsOf(vouchers),
      salesToVerify: amountsOf(sales),
    };
  },

  getDueChecks: async (
    nearDays = 7,
    branch?: string | null
  ): Promise<IVoucher[]> => {
    const today = todayIso();
    const horizon = dayjs().add(nearDays, "day").format("YYYY-MM-DD");

    const checks = await everyRow<IVoucher>(() =>
      scopeToBranch(
        supabase
          .from("vouchers")
          .select("*")
          .eq("type", "check")
          .eq("status", "approved")
          .lte("check_due_date", horizon)
          .or(`check_due_date.gte.${today},payable_id.not.is.null`)
          .order("check_due_date", { ascending: true }),
        branch
      )
    );
    const isUpcoming = (check: IVoucher) => (check.check_due_date ?? "") >= today;
    const pastPayableIds = checks.flatMap((check) =>
      !isUpcoming(check) && check.payable_id ? [check.payable_id] : []
    );
    if (pastPayableIds.length === 0) return checks.filter(isUpcoming);

    const unpaid = await everyRowIn<{ id: string }>(pastPayableIds, (ids) =>
      supabase.from("payables").select("id").in("id", ids).neq("status", "paid")
    );

    const unpaidIds = new Set(unpaid.map((row) => row.id));

    return checks.filter(
      (check) =>
        isUpcoming(check) ||
        (check.payable_id !== null && unpaidIds.has(check.payable_id))
    );
  },
};

export default dashboardServices;
