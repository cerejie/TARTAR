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
  OverviewPeriod,
  SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import type {
  IPayable,
  IReceivable,
} from "../../models/data/ledger/ledger.response";
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
import { supabase, toError } from "../../utils/supabase.utils";

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

  const vouchers = await supabase
    .from("vouchers")
    .select("payable_id, transaction_id, category, check_bank")
    .in(
      "payable_id",
      payables.map((payable) => payable.id)
    );
  if (vouchers.error) throw toError(vouchers.error);

  const voucherRows = (vouchers.data ?? []) as PayableVoucherRow[];
  const transactionIds = voucherRows.flatMap((voucher) =>
    voucher.transaction_id ? [voucher.transaction_id] : []
  );

  const transactions = transactionIds.length
    ? await supabase
        .from("transactions")
        .select("id, type, cash_account, bank_account_id")
        .in("id", transactionIds)
    : { data: [], error: null };
  if (transactions.error) throw toError(transactions.error);

  const transactionById = new Map(
    ((transactions.data ?? []) as PayableTransactionRow[]).map((row) => [
      row.id,
      row,
    ])
  );
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
type BalanceRow = { branch: string; balance?: number | string };

type CountedVoucher = Pick<IVoucher, "status" | "amount">;

type CountedTransactionRow = TypedAmountRow & {
  vouchers: CountedVoucher | CountedVoucher[] | null;
};

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

const outstandingOf = async (
  table: "receivables" | "payables",
  branch?: string | null
): Promise<number> => {
  const { data, error } = await scopeToBranch(
    supabase.from(table).select("amount, paid_amount").neq("status", "paid"),
    branch
  );
  if (error) throw toError(error);
  return outstanding((data ?? []) as OutstandingRow[]);
};

const createdSince = async (
  table: "receivables" | "payables",
  start: dayjs.Dayjs | null,
  branch?: string | null
): Promise<number> => {
  if (!start) return 0;
  const { data, error } = await scopeToBranch(
    supabase.from(table).select("amount").gte("created_at", start.toISOString()),
    branch
  );
  if (error) throw toError(error);
  return sum((data ?? []) as AmountRow[]);
};

const dashboardServices = {
  getSummary: async (branch?: string | null): Promise<IDashboardSummary> => {
    const today = todayIso();
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    const [cash, recent, thisMonth, receivables, payables] =
      await Promise.all([
        scopeToBranch(
          supabase.from("cash_accounts").select("account, balance"),
          branch
        ),
        scopeToBranch(
          supabase
            .from("transactions")
            .select(`${countedColumns}, txn_date`)
            .in("type", ["sale", "expense"])
            .gte("txn_date", yesterday)
            .lte("txn_date", today),
          branch
        ),
        scopeToBranch(
          supabase
            .from("transactions")
            .select(countedColumns)
            .gte("txn_date", monthStart())
            .lte("txn_date", today),
          branch
        ),
        scopeToBranch(
          supabase
            .from("receivables")
            .select("amount, paid_amount")
            .neq("status", "paid"),
          branch
        ),
        scopeToBranch(
          supabase
            .from("payables")
            .select("amount, paid_amount")
            .neq("status", "paid"),
          branch
        ),
      ]);

    const firstError = [
      cash,
      recent,
      thisMonth,
      receivables,
      payables,
    ].find((result) => result.error)?.error;
    if (firstError) throw toError(firstError);

    const cashRows = (cash.data ?? []) as {
      account: string;
      balance: number | string;
    }[];
    const balanceOf = (account: string) =>
      cashRows
        .filter((row) => row.account === account)
        .reduce((total, row) => total + Number(row.balance), 0);

    const recentRows = (recent.data ?? []) as unknown as (CountedTransactionRow & {
      txn_date: string;
    })[];
    const isExpense = (row: TypedAmountRow) => row.type === "expense";
    const onDay = (date: string, predicate: (row: TypedAmountRow) => boolean) =>
      sumCountedRows(
        recentRows.filter((row) => row.txn_date === date && predicate(row))
      );

    const thisMonthRows = (thisMonth.data ?? []) as unknown as CountedTransactionRow[];

    const matching = (
      rows: CountedTransactionRow[],
      predicate: (row: TypedAmountRow) => boolean
    ) => sum(rows.filter(predicate));
    const ofDirection = (rows: CountedTransactionRow[], types: string[]) =>
      sumCountedRows(rows.filter((row) => types.includes(row.type)));

    return {
      currentCash: balanceOf("cash_drawer"),
      bankBalance: balanceOf("bank_account"),
      todaysSales: onDay(today, isVerifiedSale),
      todaysExpenses: onDay(today, isExpense),
      yesterdaysSales: onDay(yesterday, isVerifiedSale),
      yesterdaysExpenses: onDay(yesterday, isExpense),
      accountsReceivable: outstanding(
        (receivables.data ?? []) as OutstandingRow[]
      ),
      accountsPayable: outstanding((payables.data ?? []) as OutstandingRow[]),
      monthlySales: sumCountedRows(thisMonthRows.filter(isVerifiedSale)),
      monthlyPendingSales: matching(thisMonthRows, isPendingSale),
      monthlyCashIn: ofDirection(thisMonthRows, cashInflowTypes),
      monthlyCashOut: ofDirection(thisMonthRows, cashOutflowTypes),
    };
  },

  getOverview: async (
    period: OverviewPeriod,
    branch?: string | null
  ): Promise<IDashboardOverview> => {
    const start = overviewPeriodStart(period);
    const salesAndExpenses = supabase
      .from("transactions")
      .select(countedColumns)
      .in("type", ["sale", "expense"])
      .lte("txn_date", todayIso());

    const [transactions, arOutstanding, arNew, apOutstanding, apNew] =
      await Promise.all([
        scopeToBranch(
          start
            ? salesAndExpenses.gte("txn_date", start.format("YYYY-MM-DD"))
            : salesAndExpenses,
          branch
        ),
        outstandingOf("receivables", branch),
        createdSince("receivables", start, branch),
        outstandingOf("payables", branch),
        createdSince("payables", start, branch),
      ]);
    if (transactions.error) throw toError(transactions.error);

    const rows = (transactions.data ?? []) as unknown as CountedTransactionRow[];

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

    const { data, error } = await scopeToBranch(
      supabase
        .from("transactions")
        .select("txn_date, amount")
        .eq("type", "sale")
        .eq("sale_status", "verified")
        .gte("txn_date", from.format("YYYY-MM-DD")),
      branch
    );
    if (error) throw toError(error);

    const byBucket = new Map<string, number>();
    for (const row of (data ?? []) as (AmountRow & { txn_date: string })[]) {
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
    const [cash, sales, expenses, receivables, payables] = await Promise.all([
      supabase.from("cash_accounts").select("branch, balance"),
      supabase
        .from("transactions")
        .select("branch, amount")
        .eq("type", "sale")
        .eq("sale_status", "verified"),
      supabase
        .from("transactions")
        .select(`branch, ${countedColumns}`)
        .eq("type", "expense"),
      supabase
        .from("receivables")
        .select("branch, amount, paid_amount")
        .neq("status", "paid"),
      supabase
        .from("payables")
        .select("branch, amount, paid_amount")
        .neq("status", "paid"),
    ]);

    const firstError = [cash, sales, expenses, receivables, payables].find(
      (result) => result.error
    )?.error;
    if (firstError) throw toError(firstError);

    const totalBy = (
      rows: (BalanceRow & { amount?: number | string })[] | null,
      branch: string,
      key: "amount" | "balance"
    ) =>
      (rows ?? [])
        .filter((row) => row.branch === branch)
        .reduce((total, row) => total + Number(row[key] ?? 0), 0);

    const outstandingBy = (
      rows: (OutstandingRow & { branch: string })[] | null,
      branch: string
    ) =>
      (rows ?? [])
        .filter((row) => row.branch === branch)
        .reduce(
          (total, row) => total + (Number(row.amount) - Number(row.paid_amount)),
          0
        );

    return branches.map((branch) => ({
      branch: branch.slug,
      branchName: branch.name,
      cashBalance: totalBy(cash.data as never, branch.slug, "balance"),
      sales: totalBy(sales.data as never, branch.slug, "amount"),
      expenses: sumCountedRows(
        ((expenses.data ?? []) as unknown as (CountedTransactionRow & {
          branch: string;
        })[]).filter((row) => row.branch === branch.slug)
      ),
      receivables: outstandingBy(receivables.data as never, branch.slug),
      payables: outstandingBy(payables.data as never, branch.slug),
    }));
  },

  getDueAlerts: async (
    nearDays = 7,
    branch?: string | null
  ): Promise<IDueAlerts> => {
    const today = todayIso();
    const horizon = dayjs().add(nearDays, "day").format("YYYY-MM-DD");

    const [receivables, payables] = await Promise.all([
      scopeToBranch(
        supabase
          .from("receivables")
          .select("*")
          .neq("status", "paid")
          .lte("due_date", horizon),
        branch
      ),
      scopeToBranch(
        supabase
          .from("payables")
          .select("*")
          .neq("status", "paid")
          .lte("due_date", horizon),
        branch
      ),
    ]);

    if (receivables.error) throw toError(receivables.error);
    if (payables.error) throw toError(payables.error);

    const receivableRows = (receivables.data ?? []) as IReceivable[];
    const payableRows = await toDuePayables(
      (payables.data ?? []) as IPayable[]
    );
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

  getDueChecks: async (
    nearDays = 7,
    branch?: string | null
  ): Promise<IVoucher[]> => {
    const today = todayIso();
    const horizon = dayjs().add(nearDays, "day").format("YYYY-MM-DD");

    const { data, error } = await scopeToBranch(
      supabase
        .from("vouchers")
        .select("*")
        .eq("type", "check")
        .eq("status", "approved")
        .lte("check_due_date", horizon)
        .or(`check_due_date.gte.${today},payable_id.not.is.null`)
        .order("check_due_date", { ascending: true }),
      branch
    );
    if (error) throw toError(error);

    const checks = (data ?? []) as IVoucher[];
    const isUpcoming = (check: IVoucher) => (check.check_due_date ?? "") >= today;
    const pastPayableIds = checks.flatMap((check) =>
      !isUpcoming(check) && check.payable_id ? [check.payable_id] : []
    );
    if (pastPayableIds.length === 0) return checks.filter(isUpcoming);

    const unpaid = await supabase
      .from("payables")
      .select("id")
      .in("id", pastPayableIds)
      .neq("status", "paid");
    if (unpaid.error) throw toError(unpaid.error);

    const unpaidIds = new Set(
      ((unpaid.data ?? []) as { id: string }[]).map((row) => row.id)
    );

    return checks.filter(
      (check) =>
        isUpcoming(check) ||
        (check.payable_id !== null && unpaidIds.has(check.payable_id))
    );
  },
};

export default dashboardServices;
