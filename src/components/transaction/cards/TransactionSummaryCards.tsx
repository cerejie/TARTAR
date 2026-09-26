import { ArrowLeftRight, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useTransactionListHook } from "../../../hook/data/transaction/transaction.list.hook";

const TransactionSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = useTransactionListHook();

  return (
    <BentoGrid>
      <BentoCell span="quarter">
        <StatCard
          title="Cash In"
          value={summary.cashIn}
          loading={summaryLoading}
          variant="positive"
          icon={<TrendingUp />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Cash Out"
          value={summary.cashOut}
          loading={summaryLoading}
          variant="negative"
          icon={<TrendingDown />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Net Cash Flow"
          value={summary.net}
          loading={summaryLoading}
          variant={summary.net < 0 ? "negative" : "positive"}
          icon={<ArrowLeftRight />}
          caption="Cash in less cash out"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Sales"
          value={summary.sales}
          loading={summaryLoading}
          variant="brand"
          icon={<ShoppingBag />}
          caption="Sales transactions only"
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default TransactionSummaryCards;
