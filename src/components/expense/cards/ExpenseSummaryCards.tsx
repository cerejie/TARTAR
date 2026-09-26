import { ChartPie, FileCheck, ReceiptText, TrendingDown } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useExpenseListHook } from "../../../hook/data/expense/expense.list.hook";

const ExpenseSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = useExpenseListHook();

  return (
    <BentoGrid>
      <BentoCell span="quarter">
        <StatCard
          title="Total Expenses"
          value={summary.total}
          loading={summaryLoading}
          variant="negative"
          icon={<TrendingDown />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Top Category"
          value={summary.topCategory?.amount ?? 0}
          loading={summaryLoading}
          variant="brand"
          icon={<ChartPie />}
          caption={summary.topCategory?.label ?? "No expenses yet"}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Records"
          value={summary.records}
          loading={summaryLoading}
          raw
          variant="default"
          icon={<ReceiptText />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Pending Vouchers"
          value={summary.pendingVouchers}
          loading={summaryLoading}
          raw
          variant="default"
          icon={<FileCheck />}
          caption="Awaiting approval"
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default ExpenseSummaryCards;
