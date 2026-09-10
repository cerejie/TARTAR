import {
  FallOutlined,
  FileProtectOutlined,
  PieChartOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { useExpenseListHook } from "../../../hook/data/expense/expense.list.hook";
import { statGrid } from "../../../styles/stat/stat.css";

const ExpenseSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = useExpenseListHook();

  return (
    <div className={`${statGrid}`}>
      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Total Expenses"
            value={summary.total}
            loading={summaryLoading}
            variant="negative"
            icon={<FallOutlined />}
            caption={summaryPeriod}
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Top Category"
            value={summary.topCategory?.amount ?? 0}
            loading={summaryLoading}
            variant="brand"
            icon={<PieChartOutlined />}
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
            icon={<ProfileOutlined />}
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
            icon={<FileProtectOutlined />}
            caption="Awaiting approval"
          />
        </BentoCell>
      </BentoGrid>
    </div>
  );
};

export default ExpenseSummaryCards;
