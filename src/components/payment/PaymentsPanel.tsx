import { Check, User, X } from "lucide-react";
import StatusTag from "../common/status/StatusTag";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  paymentStatusColors,
  type PaymentKind,
} from "../../enums/ledger.enum";
import { usePaymentListHook } from "../../hook/data/payment/payment.list.hook";
import type { ILedgerPayment } from "../../models/data/payment/payment.response";
import { formatDate, formatMoney } from "../../utils/format.utils";
import AppButton from "../common/button/AppButton";
import SectionCard from "../common/card/SectionCard";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import { NameCell, RowActions } from "../common/table/TableDecor";

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

  const openConfirm = useConfirm();

  const verifiedHintOf = (payment: ILedgerPayment) =>
    payment.verified_by && payment.status !== "pending"
      ? `${userNameOf(payment.verified_by)} · ${formatDate(payment.verified_at)}`
      : undefined;

  const columns: IDataTableColumn<ILedgerPayment>[] = [
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
            dataIndex: "party_name" as const,
            render: (name: string) => (
              <NameCell icon={<User />}>{name}</NameCell>
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
        ]
      : []),
    {
      title: "",
      key: "actions",
      width: 190,
      render: (_, payment) => (
        <RequirePermission can="isManager" fallback={null}>
          <RowActions>
            {payment.status === "pending" ? (
              <AppButton
                variant="ghost"
                size="sm"
                onPress={() => void verifyMutation.mutate(payment.id)}
              >
                <Check />
                {verb}
              </AppButton>
            ) : null}
            {payment.status !== "rejected" ? (
              <AppButton
                variant="destructive"
                size="sm"
                onPress={() =>
                  openConfirm({
                    kind: "delete",
                    title: "Reject payment?",
                    message:
                      "Rejecting this payment restores the balances it settled.",
                    okText: "Reject",
                    cancelText: "Cancel",
                    onConfirm: () => rejectMutation.mutate(payment.id),
                  })
                }
              >
                <X />
                Reject
              </AppButton>
            ) : null}
          </RowActions>
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
      flush
    >
      {table}
    </SectionCard>
  );
};

export default PaymentsPanel;
