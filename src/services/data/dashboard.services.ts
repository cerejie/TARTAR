import dayjs from "dayjs";
import {
  cashInflowTypes,
  cashOutflowTypes,
} from "../../enums/transaction.enum";
import type { IBranch } from "../../models/data/branch/branch.response";
import type {
  IBranchMonitorRow,
  IDailySalesPoint,
  IDashboardSummary,
  IDueAlerts,
  SalesPeriod,
} from "../../models/data/dashboard/dashboard.response";
import type {
  IPayable,
  IReceivable,
} from "../../models/data/ledger/ledger.response";
import { scopeToBranch } from "../../utils/filter.utils";
import { todayIso } from "../../utils/format.utils";
import { supabase, toError } from "../../utils/supabase.utils";

type AmountRow = { amount: number | string };
type TypedAmountRow = AmountRow & { type: string };
type BalanceRow = { branch: string; balance?: number | string };
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

const dashboardServices = {
  getSummary: async (branch?: string | null): Promise<IDashboardSummary> => {
    const today = todayIso();
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const lastMonthStart = dayjs()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    const lastMonthCutoff = dayjs()
      .subtract(1, "month")
      .format("YYYY-MM-DD");

    const [cash, recent, thisMonth, lastMonth, receivables, payables] =
      await Promise.all([
        scopeToBranch(
          supabase.from("cash_accounts").select("account, balance"),
          branch
        ),
        scopeToBranch(
          supabase
            .from("transactions")
            .select("type, txn_date, amount")
            .in("type", ["sale", "expense"])
            .gte("txn_date", yesterday)
            .lte("txn_date", today),
          branch
        ),
        scopeToBranch(
          supabase
            .from("transactions")
            .select("type, amount")
            .gte("txn_date", monthStart())
            .lte("txn_date", today),
          branch
        ),
        scopeToBranch(
          supabase
            .from("transactions")
            .select("type, amount")
            .in("type", ["sale", "expense"])
            .gte("txn_date", lastMonthStart)
            .lte("txn_date", lastMonthCutoff),
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
      lastMonth,
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

    const recentRows = (recent.data ?? []) as (TypedAmountRow & {
      txn_date: string;
    })[];
    const onDay = (date: string, type: string) =>
      sum(recentRows.filter((row) => row.txn_date === date && row.type === type));

    const thisMonthRows = (thisMonth.data ?? []) as TypedAmountRow[];
    const lastMonthRows = (lastMonth.data ?? []) as TypedAmountRow[];

    const ofType = (rows: TypedAmountRow[], type: string) =>
      sum(rows.filter((row) => row.type === type));
    const ofDirection = (rows: TypedAmountRow[], types: string[]) =>
      sum(rows.filter((row) => types.includes(row.type)));

    return {
      currentCash: balanceOf("cash_drawer"),
      bankBalance: balanceOf("bank_account"),
      todaysSales: onDay(today, "sale"),
      todaysExpenses: onDay(today, "expense"),
      yesterdaysSales: onDay(yesterday, "sale"),
      yesterdaysExpenses: onDay(yesterday, "expense"),
      accountsReceivable: outstanding(
        (receivables.data ?? []) as OutstandingRow[]
      ),
      accountsPayable: outstanding((payables.data ?? []) as OutstandingRow[]),
      monthlySales: ofType(thisMonthRows, "sale"),
      monthlyExpenses: ofType(thisMonthRows, "expense"),
      lastMonthSales: ofType(lastMonthRows, "sale"),
      lastMonthExpenses: ofType(lastMonthRows, "expense"),
      monthlyCashIn: ofDirection(thisMonthRows, cashInflowTypes),
      monthlyCashOut: ofDirection(thisMonthRows, cashOutflowTypes),
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
      supabase.from("transactions").select("branch, amount").eq("type", "sale"),
      supabase
        .from("transactions")
        .select("branch, amount")
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
      expenses: totalBy(expenses.data as never, branch.slug, "amount"),
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
    const payableRows = (payables.data ?? []) as IPayable[];
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
};

export default dashboardServices;
