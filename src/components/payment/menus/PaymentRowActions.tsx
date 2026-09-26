import { Check, X } from "lucide-react";
import RowActionMenu from "../../common/table/RowActionMenu";
import type { IRowAction } from "../../../models/common/action.model";
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";

type IProps = {
  payment: ILedgerPayment;
  verb: string;
  onApprove: (payment: ILedgerPayment) => void;
  onReject: (payment: ILedgerPayment) => void;
};

const PaymentRowActions = ({ payment, verb, onApprove, onReject }: IProps) => {
  const actions: IRowAction[] = [
    ...(payment.status === "pending"
      ? [
          {
            key: "verify",
            label: verb,
            icon: <Check />,
            onSelect: () => onApprove(payment),
          },
        ]
      : []),
    ...(payment.status !== "rejected"
      ? [
          {
            key: "reject",
            label: "Reject",
            icon: <X />,
            danger: true,
            onSelect: () => onReject(payment),
          },
        ]
      : []),
  ];

  return <RowActionMenu actions={actions} />;
};

export default PaymentRowActions;
