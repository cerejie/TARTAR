import SectionCard from "../../common/card/SectionCard";
import CashFlowDonut from "../CashFlowDonut";

type IProps = {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const CashFlowCard = ({
  cashIn,
  cashOut,
  netCashFlow,
  loading,
  error,
  onRetry,
}: IProps) => {
  return (
    <SectionCard
      title="Cash Flow (MTD)"
      subtitle="Cash in vs. cash out this month"
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      <CashFlowDonut cashIn={cashIn} cashOut={cashOut} netCashFlow={netCashFlow} />
    </SectionCard>
  );
};

export default CashFlowCard;
