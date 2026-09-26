import { Check, X } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
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
import { nowrapCell } from "../../../styles/table/table.styles";
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
    sortKey,
    sortOptions,
    changeSort,
    loading,
    refreshing,
    error,
    retry,
    statusLabels,
    verb,
    userNameOf,
    verifyMutation,
    rejectMutation,
  } = usePaymentListHook(kind);

  const openConfirm = useConfirm();
  const partyLabel = kind === "receivable" ? "Customer" : "Supplier";

  const verifiedHintOf = (payment: ILedgerPayment) =>
    payment.verified_by && payment.status !== "pending"
      ? `${userNameOf(payment.verified_by)} · ${formatDate(payment.verified_at)}`
      : undefined;

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
            icon: <Check />,
            onSelect: () => approve(payment),
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

  const columns: IDataTableColumn<ILedgerPayment>[] = [
    {
      title: "Date",
      dataIndex: "paid_at",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: partyLabel,
      dataIndex: "party_name",
      skeleton: "avatar",
      render: (name: string) => <AvatarCell name={name} />,
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
              <RowActionMenu actions={actionsOf(payment)} />
            ),
          },
        ]
      : []),
  ];

  return (
    <TablePanel
      title="Payments"
      toolbar={
        <FilterToolbar
          sort={
            <SortSelect
              value={sortKey}
              options={sortOptions}
              onChange={changeSort}
            />
          }
        >
          <LedgerFilterBar scope="payments" paymentKind={kind} layout="popover" />
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
        refreshing={refreshing}
        error={error}
        onRetry={retry}
        pagination={pagination}
        detachedPagination
        emptyText="No payments match the current filters"
      />
    </TablePanel>
  );
};

export default LedgerPaymentsTable;
