import { CheckOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  paymentStatusColors,
  type PaymentKind,
} from "../../enums/ledger.enum";
import { usePaymentListHook } from "../../hook/data/payment/payment.list.hook";
import type { ILedgerPayment } from "../../models/data/payment/payment.response";
import { formatDate, formatMoney } from "../../utils/format.utils";
import SectionCard from "../common/card/SectionCard";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import { NameCell } from "../common/table/TableDecor";

type IProps = {
  kind: PaymentKind;
  party?: { partyId: string | null; partyName: string };
  compact?: boolean;
};

const PaymentsPanel = ({ kind, party, compact }: IProps) => {
  const {
    permissions,
    payments,
    loading,
    statusLabels,
    verb,
    userNameOf,
    verifyMutation,
    rejectMutation,
  } = usePaymentListHook(kind, party);

  const columns: ColumnsType<ILedgerPayment> = [
    {
      title: "Date",
      dataIndex: "paid_at",
      width: 120,
      render: (value: string) => formatDate(value),
    },
    ...(party
      ? []
      : [
          {
            title: kind === "receivable" ? "Customer" : "Supplier",
            dataIndex: "party_name",
            render: (name: string) => (
              <NameCell icon={<UserOutlined />}>{name}</NameCell>
            ),
          },
        ]),
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
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
      render: (status: ILedgerPayment["status"], payment) => {
        const tag = (
          <Tag color={paymentStatusColors[status]}>{statusLabels[status]}</Tag>
        );

        if (!payment.verified_by || status === "pending") return tag;

        return (
          <Tooltip
            title={`${userNameOf(payment.verified_by)} · ${formatDate(
              payment.verified_at
            )}`}
          >
            {tag}
          </Tooltip>
        );
      },
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            key: "created_by",
            render: (_: unknown, payment: ILedgerPayment) =>
              userNameOf(payment.created_by),
          },
        ]
      : []),
    {
      title: "",
      key: "actions",
      width: 190,
      render: (_, payment) => (
        <RequirePermission can="isManager" fallback={null}>
          <Space>
            {payment.status === "pending" ? (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => void verifyMutation.mutate(payment.id)}
              >
                {verb}
              </Button>
            ) : null}
            {payment.status !== "rejected" ? (
              <Popconfirm
                title="Reject this payment and restore the balances?"
                onConfirm={() => void rejectMutation.mutate(payment.id)}
              >
                <Button type="link" danger size="small" icon={<CloseOutlined />}>
                  Reject
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        </RequirePermission>
      ),
    },
  ];

  const table = (
    <DataTable<ILedgerPayment>
      columns={columns}
      data={payments}
      loading={loading}
      pageSize={compact ? 5 : 10}
      emptyText="No payments recorded yet"
    />
  );

  if (compact) return table;

  return (
    <SectionCard
      title={kind === "receivable" ? "Customer Payments" : "Supplier Payments"}
      subtitle={`Applied immediately — pending until a manager ${verb.toLowerCase()}s them`}
      flush
    >
      {table}
    </SectionCard>
  );
};

export default PaymentsPanel;
