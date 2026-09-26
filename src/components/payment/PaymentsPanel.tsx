import StatusTag from "../common/status/StatusTag";
import DataTable from "../common/table/DataTable";
import PaymentRowActions from "./menus/PaymentRowActions";
import {
  paymentStatusColors,
  type PaymentKind,
} from "../../enums/ledger.enum";
import { usePaymentListHook } from "../../hook/data/payment/payment.list.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import type { ILedgerPayment } from "../../models/data/payment/payment.response";
import { nowrapCell } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";

type IProps = {
  kind: PaymentKind;
  party: { partyId: string | null; partyName: string };
};

const PaymentsPanel = ({ kind, party }: IProps) => {
  const {
    permissions,
    payments,
    loading,
    refreshing,
    error,
    retry,
    statusLabels,
    verb,
    userNameOf,
    verifiedHintOf,
    approvePayment,
    rejectPayment,
  } = usePaymentListHook(kind, party);

  const columns: IDataTableColumn<ILedgerPayment>[] = [
    {
      title: "Date",
      dataIndex: "paid_at",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      className: nowrapCell,
      render: (status: ILedgerPayment["status"], payment) => (
        <StatusTag
          color={paymentStatusColors[status]}
          label={statusLabels[status]}
          hint={verifiedHintOf(payment)}
        />
      ),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            key: "created_by",
            render: (_: unknown, payment: ILedgerPayment) =>
              userNameOf(payment.created_by),
          },
          {
            title: "Action",
            key: "actions",
            align: "center" as const,
            className: nowrapCell,
            render: (_: unknown, payment: ILedgerPayment) => (
              <PaymentRowActions
                payment={payment}
                verb={verb}
                onApprove={approvePayment}
                onReject={rejectPayment}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable<ILedgerPayment>
      columns={columns}
      data={payments}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRetry={retry}
      pageSize={5}
      emptyText="No payments recorded yet"
    />
  );
};

export default PaymentsPanel;
