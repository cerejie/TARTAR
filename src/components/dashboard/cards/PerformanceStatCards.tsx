import { ChartLine, ReceiptText } from "lucide-react";
import { formatMoney } from "../../../utils/format.utils";
import { expensesPath, salesPath } from "../../../utils/route.utils";
import StatCard from "../../common/card/StatCard";
import StatusTag from "../../common/status/StatusTag";
import BentoCell from "../../common/view/BentoCell";

type IProps = {
  monthlySales: number | undefined;
  monthlyPendingSales: number;
  monthlyExpenses: number | undefined;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const PerformanceStatCards = ({
  monthlySales,
  monthlyPendingSales,
  monthlyExpenses,
  loading,
  error,
  onRetry,
}: IProps) => {
  return (
    <>
      <BentoCell span="quarter">
        <StatCard
          title="Monthly Sales"
          value={monthlySales}
          loading={loading}
          error={error}
          onRetry={onRetry}
          variant="positive"
          icon={<ChartLine />}
          href={salesPath}
          chip={
            monthlyPendingSales ? (
              <StatusTag
                color="warning"
                label={`${formatMoney(monthlyPendingSales)} pending`}
              />
            ) : null
          }
          caption="Verified, month to date"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Monthly Expenses"
          value={monthlyExpenses}
          loading={loading}
          error={error}
          onRetry={onRetry}
          variant="negative"
          icon={<ReceiptText />}
          href={expensesPath}
          caption="Expenses, month to date"
        />
      </BentoCell>
    </>
  );
};

export default PerformanceStatCards;
