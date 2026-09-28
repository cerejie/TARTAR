import { HandCoins, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { adminHomeTiles } from "../../../styles/admin/admin.home.styles";
import { formatMoney } from "../../../utils/format.utils";
import MetricTile from "../../common/app/MetricTile";

type IProps = {
  sales: number | undefined;
  expenses: number | undefined;
  arOutstanding: number | undefined;
  arNew: number;
  apOutstanding: number | undefined;
  apNew: number;
  showNewAmounts: boolean;
  periodCaption: string;
  receivablesPath: string;
  payablesPath: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const OverviewTiles = ({
  sales,
  expenses,
  arOutstanding,
  arNew,
  apOutstanding,
  apNew,
  showNewAmounts,
  periodCaption,
  receivablesPath,
  payablesPath,
  loading,
  error,
  onRetry,
}: IProps) => {
  const newAmountLine = (amount: number) =>
    showNewAmounts ? `+${formatMoney(amount)} new ${periodCaption}` : undefined;
  const tileState = { loading, error, onRetry };

  return (
    <div className={adminHomeTiles}>
      <MetricTile
        label="Sales"
        value={sales}
        icon={<TrendingUp />}
        tone="positive"
        subLine={`Verified sales ${periodCaption}`}
        {...tileState}
      />
      <MetricTile
        label="Expenses"
        value={expenses}
        icon={<ReceiptText />}
        tone="negative"
        subLine={`Spent ${periodCaption}`}
        {...tileState}
      />
      <MetricTile
        label="Receivables"
        value={arOutstanding}
        icon={<Wallet />}
        tone="info"
        subLine={newAmountLine(arNew)}
        href={receivablesPath}
        {...tileState}
      />
      <MetricTile
        label="Payables"
        value={apOutstanding}
        icon={<HandCoins />}
        tone="warning"
        subLine={newAmountLine(apNew)}
        href={payablesPath}
        {...tileState}
      />
    </div>
  );
};

export default OverviewTiles;
