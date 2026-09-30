import { CircleCheck, FileText } from "lucide-react";
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
  payableStatusColors,
  payableStatusLabels,
} from "../../../enums/ledger.enum";
import { useModal } from "../../../hook/common/modal.hook";
import {
  useLedgerScopeHook,
  type ILedgerRecord,
} from "../../../hook/data/ledger/ledger.scope.hook";
import { payableMarkPaidModalKey } from "../../../keys/modal.keys";
import { ledgerExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  isLedgerOverdue,
  payableAmountDueOf,
  payableStatusOf,
  type IPayable,
} from "../../../models/data/ledger/ledger.response";
import {
  branchCell,
  dataTableRowOverdue,
  nowrapCell,
} from "../../../styles/table/table.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../utils/format.utils";

const isPayable = (row: ILedgerRecord): row is IPayable =>
  "supplier_name" in row;

const PayableRecordsTable = () => {
  const {
    permissions,
    rows,
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
    branchName,
    userNameOf,
  } = useLedgerScopeHook("payables");
  const markPaidModal = useModal<IPayable>(payableMarkPaidModalKey);

  const payables = rows.filter(isPayable);

  const actionsOf = (row: IPayable): IRowAction[] =>
    permissions.encodeTransactions
      ? [
          {
            key: "mark-paid",
            label: row.status === "paid" ? "Already paid" : "Mark paid",
            icon: <CircleCheck />,
            disabled: row.status === "paid",
            onSelect: () => markPaidModal.openModal(row),
          },
        ]
      : [];

  const columns: IDataTableColumn<IPayable>[] = [
    {
      title: "Due date",
      dataIndex: "due_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Supplier",
      key: "party",
      skeleton: "avatar",
      render: (_, row) => (
        <AvatarCell
          name={row.supplier_name}
          hint={row.reference_number ?? undefined}
        />
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      className: branchCell,
      render: branchName,
    },
    {
      title: "Amount",
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (_, row) => formatMoney(payableAmountDueOf(row)),
    },
    {
      title: "Status",
      mobile: "status",
      key: "status",
      className: nowrapCell,
      render: (_, row) => {
        const status = payableStatusOf(row);
        return (
          <StatusTag
            color={payableStatusColors[status]}
            label={payableStatusLabels[status]}
          />
        );
      },
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, row) => <RowActionMenu actions={actionsOf(row)} />,
    },
  ];

  const detailSections: IDetailSection<IPayable>[] = [
    {
      key: "record",
      title: "Record",
      icon: <FileText />,
      items: [
        {
          key: "created",
          label: "Created",
          render: (row) => formatDateTime(row.created_at),
        },
        {
          key: "recorded_by",
          label: "Recorded by",
          render: (row) => userNameOf(row.created_by),
        },
      ],
    },
  ];

  return (
    <TablePanel
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
          <LedgerFilterBar scope="payables" showSearch layout="popover" />
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
      <DataTable<IPayable>
        columns={columns}
        data={payables}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={retry}
        pagination={pagination}
        detachedPagination
        expansionKey={ledgerExpansionKey("payables")}
        detailSections={detailSections}
        emptyText="No payables match the current filters"
        rowClassName={(row) =>
          isLedgerOverdue(row) ? dataTableRowOverdue : ""
        }
      />
    </TablePanel>
  );
};

export default PayableRecordsTable;
