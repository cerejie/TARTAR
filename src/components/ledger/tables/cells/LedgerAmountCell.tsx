import {
  ledgerAmountCell,
  ledgerAmountCellOf,
} from "../../../../styles/ledger/ledger.styles";
import { formatMoney } from "../../../../utils/format.utils";

type IProps = {
  amount: number;
  paidAmount: number;
  paid: boolean;
};

const LedgerAmountCell = ({ amount, paidAmount, paid }: IProps) => {
  const total = Number(amount);
  const balance = total - Number(paidAmount);
  const isPartlyPaid = !paid && balance < total;

  if (paid || !isPartlyPaid) {
    return <span>{formatMoney(paid ? total : balance)}</span>;
  }

  return (
    <span className={ledgerAmountCell}>
      <span>{formatMoney(balance)}</span>
      <span className={ledgerAmountCellOf}>of {formatMoney(total)}</span>
    </span>
  );
};

export default LedgerAmountCell;
