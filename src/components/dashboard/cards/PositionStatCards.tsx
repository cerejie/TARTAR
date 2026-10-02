import { FileCheck, User } from "lucide-react";
import { payablesPath, receivablesPath } from "../../../utils/route.utils";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";

type IProps = {
  accountsReceivable: number | undefined;
  accountsPayable: number | undefined;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const PositionStatCards = ({
  accountsReceivable,
  accountsPayable,
  loading,
  error,
  onRetry,
}: IProps) => {
  return (
    <>
      <BentoCell span="quarter">
        <StatCard
          title="Accounts Receivable"
          value={accountsReceivable}
          loading={loading}
          error={error}
          onRetry={onRetry}
          icon={<User />}
          href={receivablesPath}
          caption="Total outstanding"
        />
      </BentoCell>
      <BentoCell span="quarter">
        <StatCard
          title="Accounts Payable"
          value={accountsPayable}
          loading={loading}
          error={error}
          onRetry={onRetry}
          icon={<FileCheck />}
          href={payablesPath}
          caption="Total outstanding"
        />
      </BentoCell>
    </>
  );
};

export default PositionStatCards;
