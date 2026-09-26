import { CircleDollarSign, FileText, Plus, Trash2 } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import ProgressCell from "../../common/table/ProgressCell";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
} from "../../../enums/ledger.enum";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import {
  useLedgerScopeHook,
  type ILedgerInput,
  type ILedgerRecord,
  type LedgerScope,
} from "../../../hook/data/ledger/ledger.scope.hook";
import { ledgerExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  isLedgerOverdue,
  ledgerBalance,
} from "../../../models/data/ledger/ledger.response";
import {
  dataTableRowOverdue,
  nowrapCell,
} from "../../../styles/table/table.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../utils/format.utils";

type IProps = {
  scope: LedgerScope;
};

const LedgerRecordsTable = ({ scope }: IProps) => {
  const {
    permissions,
    title,
    partyLabel,
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
    formModal,
    schema,
    sections,
    defaults,
    createMutation,
    removeMutation,
    openPaymentFor,
  } = useLedgerScopeHook(scope);

  const openConfirm = useConfirm();
  const noun = title.toLowerCase();
  const partyNameOf = (row: ILedgerRecord) =>
    "customer_name" in row ? row.customer_name : row.supplier_name;

  const actionsOf = (row: ILedgerRecord): IRowAction[] => [
    {
      key: "payment",
      label:
        row.status === "paid" ? "Record payment — already paid" : "Record payment",
      icon: <CircleDollarSign />,
      disabled: row.status === "paid",
      onSelect: () => openPaymentFor(row),
    },
    ...(permissions.isManager
      ? [
          {
            key: "delete",
            label: `Delete ${noun}`,
            icon: <Trash2 />,
            danger: true,
            onSelect: () =>
              openConfirm({
                kind: "delete",
                title: `Delete ${noun}?`,
                message: `Deleting this ${formatMoney(row.amount)} ${noun} also removes its payment allocations.`,
                onConfirm: () => removeMutation.mutate(row.id),
              }),
          },
        ]
      : []),
  ];

  const columns: IDataTableColumn<ILedgerRecord>[] = [
    {
      title: "Due date",
      dataIndex: "due_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: partyLabel,
      key: "party",
      skeleton: "avatar",
      render: (_, row) => <AvatarCell name={partyNameOf(row)} />,
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Paid",
      key: "paid",
      render: (_, row) => (
        <ProgressCell
          value={row.paid_amount}
          total={row.amount}
          label={`Paid of ${formatMoney(row.amount)}`}
          format={formatMoney}
        />
      ),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      className: nowrapCell,
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Status",
      dataIndex: "status",
      className: nowrapCell,
      render: (status: ILedgerRecord["status"], row) =>
        isLedgerOverdue(row) ? (
          <StatusTag color="negative" label="Overdue" />
        ) : (
          <StatusTag
            color={ledgerStatusColors[status]}
            label={ledgerStatusLabels[status]}
          />
        ),
    },
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, row) => <RowActionMenu actions={actionsOf(row)} />,
    },
  ];

  const detailSections: IDetailSection<ILedgerRecord>[] = [
    {
      key: "record",
      title: "Record",
      icon: <FileText />,
      items: [
        {
          key: "amount",
          label: "Amount",
          render: (row) => formatMoney(row.amount),
        },
        {
          key: "paid",
          label: "Paid",
          render: (row) => formatMoney(row.paid_amount),
        },
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
    <>
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
            actions={
              <RequirePermission can="encodeTransactions" fallback={null}>
                <AppButton onPress={() => formModal.openModal()}>
                  <Plus />
                  Record {noun}
                </AppButton>
              </RequirePermission>
            }
          >
            <LedgerFilterBar scope="ledger" showSearch layout="popover" />
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
        <DataTable<ILedgerRecord>
          columns={columns}
          data={rows}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          pagination={pagination}
          detachedPagination
          expansionKey={ledgerExpansionKey(scope)}
          detailSections={detailSections}
          emptyText={`No ${noun}s match the current filters`}
          rowClassName={(row) =>
            isLedgerOverdue(row) ? dataTableRowOverdue : ""
          }
        />
      </TablePanel>

      <EntityFormModal<ILedgerInput>
        open={formModal.modal.visible}
        title={`Record ${noun}`}
        subtitle={`Enter the ${noun} details.`}
        size="lg"
        sections={sections}
        schema={schema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </>
  );
};

export default LedgerRecordsTable;
