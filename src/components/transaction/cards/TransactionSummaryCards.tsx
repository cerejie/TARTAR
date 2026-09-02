import {
  FallOutlined,
  RiseOutlined,
  ShoppingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useTransactionListHook } from "../../../hook/data/transaction/transaction.list.hook";
import { statGrid } from "../../../styles/stat/stat.css";

const TransactionSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = useTransactionListHook();

  return (
    <div className={`${statGrid}`}>
      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Cash In"
            value={summary.cashIn}
            loading={summaryLoading}
            variant="positive"
            icon={<RiseOutlined />}
            caption={summaryPeriod}
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Cash Out"
            value={summary.cashOut}
            loading={summaryLoading}
            variant="negative"
            icon={<FallOutlined />}
            caption={summaryPeriod}
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Net Cash Flow"
            value={summary.net}
            loading={summaryLoading}
            variant={summary.net < 0 ? "negative" : "positive"}
            icon={<SwapOutlined />}
            caption="Cash in less cash out"
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Sales"
            value={summary.sales}
            loading={summaryLoading}
            variant="brand"
            icon={<ShoppingOutlined />}
            caption="Sales transactions only"
          />
        </BentoCell>
      </BentoGrid>
    </div>
  );
};

export default TransactionSummaryCards;
