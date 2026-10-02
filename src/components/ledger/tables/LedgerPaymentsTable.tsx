import { filteredEmptyHint } from "../../../models/common/table.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import PaymentRowActions from "../../payment/menus/PaymentRowActions";
import {
  paymentStatusColors,
  type PaymentKind,
} from "../../../enums/ledger.enum";
import { usePaymentListHook } from "../../../hook/data/payment/payment.list.hook";
import type { ILedgerPayment } from "../../../models/data/payment/payment.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { paymentFilterScopeOf } from "../../../utils/filter.utils";
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
    verifiedHintOf,
    approvePayment,
    rejectPayment,
  } = usePaymentListHook(kind);

  const partyLabel = kind === "receivable" ? "Customer" : "Supplier";

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
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Reference",
      mobile: "subtitle",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Status",
      mobile: "status",
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
          <LedgerFilterBar scope={paymentFilterScopeOf(kind)} paymentKind={kind} layout="popover" />
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
        totalCount={totalCount}
        onPageChange={goToPage}
        emptyText="No payments match the current filters"
        emptyHint={filteredEmptyHint}
      />
    </TablePanel>
  );
};

export default LedgerPaymentsTable;
