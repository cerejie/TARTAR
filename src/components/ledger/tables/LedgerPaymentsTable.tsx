import { CheckOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import StatusTag from "../../common/status/StatusTag";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import { NameCell } from "../../common/table/TableDecor";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import {
  paymentStatusColors,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { usePaymentListHook } from "../../../hook/data/payment/payment.list.hook";
import type { IRowAction } from "../../../models/common/action.model";
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";
import { nowrapCell } from "../../../styles/table/table.css";
import { formatDate, formatMoney } from "../../../utils/format.utils";

type IProps = {
  kind: PaymentKind;
};

const LedgerPaymentsTable = ({ kind }: IProps) => {
  const {
    permissions,
    payments,
    totalCount,
    pagination,
    goToPage,
    loading,
    statusLabels,
    verb,
    userNameOf,
    verifyMutation,
    rejectMutation,
  } = usePaymentListHook(kind);

  const openConfirm = useConfirm();
  const partyLabel = kind === "receivable" ? "Customer" : "Supplier";

  const approve = (payment: ILedgerPayment) => {
    if (kind === "receivable") {
      void verifyMutation.mutate(payment.id);
      return;
    }

    openConfirm({
      kind: "confirm",
      title: "Approve payment?",
      message: `Approve payment of ${formatMoney(payment.amount)} to ${payment.party_name}?`,
      okText: "Approve",
      onConfirm: () => verifyMutation.mutate(payment.id),
    });
  };

  const actionsOf = (payment: ILedgerPayment): IRowAction[] => [
    ...(payment.status === "pending"
      ? [
          {
            key: "verify",
            label: verb,
            icon: <CheckOutlined />,
            onSelect: () => approve(payment),
          },
        ]
      : []),
    ...(payment.status !== "rejected"
      ? [
          {
            key: "reject",
            label: "Reject",
            icon: <CloseOutlined />,
            danger: true,
            onSelect: () =>
              openConfirm({
                kind: "delete",
                title: "Reject payment?",
                message: `Rejecting this ${formatMoney(payment.amount)} payment restores the balances it settled.`,
                okText: "Reject",
                onConfirm: () => rejectMutation.mutate(payment.id),
              }),
          },
        ]
      : []),
  ];

  const columns: ColumnsType<ILedgerPayment> = [
    {
      title: "Date",
      dataIndex: "paid_at",
      className: `${nowrapCell}`,
      render: (value: string) => formatDate(value),
    },
    {
      title: partyLabel,
      dataIndex: "party_name",
      render: (name: string) => (
        <NameCell icon={<UserOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      className: `${nowrapCell}`,
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
      className: `${nowrapCell}`,
      render: (status: ILedgerPayment["status"], payment) => {
        const tag = (
          <StatusTag
            color={paymentStatusColors[status]}
            label={statusLabels[status]}
          />
        );

        if (!payment.verified_by || status === "pending") return tag;

        return (
          <Tooltip
            title={`${userNameOf(payment.verified_by)} · ${formatDate(
              payment.verified_at
            )}`}
          >
            <span>{tag}</span>
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
          {
            title: "Action",
            key: "actions",
            align: "center" as const,
            className: `${nowrapCell}`,
            render: (_: unknown, payment: ILedgerPayment) => (
              <RowActionMenu actions={actionsOf(payment)} />
            ),
          },
        ]
      : []),
  ];

  return (
    <TablePanel
      toolbar={
        <FilterToolbar>
          <LedgerFilterBar scope="payments" paymentKind={kind} />
        </FilterToolbar>
      }
      footer={
        <TablePagination
          pagination={pagination}
          totalCount={totalCount}
          onPageChange={goToPage}
        />
      }
    >
      <DataTable<ILedgerPayment>
        columns={columns}
        data={payments}
        loading={loading}
        pagination={pagination}
        detachedPagination
        emptyText="No payments match the current filters"
      />
    </TablePanel>
  );
};

export default LedgerPaymentsTable;
