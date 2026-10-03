import { FileText, History, Plus, Trash2, Wallet } from "lucide-react";
import { filteredEmptyHint } from "../../../models/common/table.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import PrimaryAction from "../../common/button/PrimaryAction";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import StatusTag from "../../common/status/StatusTag";
import UserCell from "../../user/table/cells/UserCell";
import {
  transactionTypeColors,
  transactionTypeLabels,
} from "../../../enums/transaction.enum";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { useTransactionListHook } from "../../../hook/data/transaction/transaction.list.hook";
import { transactionExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  transactionSchema,
  type ITransactionInput,
} from "../../../models/data/transaction/transaction.request";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
import { dataCardLine, nowrapCell } from "../../../styles/table/table.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatTime,
} from "../../../utils/format.utils";

const summaryOf = (row: ITransaction) =>
  row.customer?.name ?? row.supplier?.name ?? row.description;

const TransactionsTable = () => {
  const {
    permissions,
    transactions,
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
    userById,
    userNameOf,
    paymentLabelOf,
    incomeSourceLabelOf,
    formModal,
    sections,
    defaults,
    createMutation,
    removeMutation,
    deriveFormValues,
  } = useTransactionListHook();

  const openConfirm = useConfirm();
  const isCompact = useIsCompact();

  const actionsOf = (row: ITransaction): IRowAction[] => [
    {
      key: "delete",
      label: "Delete transaction",
      icon: <Trash2 />,
      danger: true,
      onSelect: () =>
        openConfirm({
          kind: "delete",
          title: "Delete transaction?",
          message: `Deleting this ${transactionTypeLabels[
            row.type
          ].toLowerCase()} of ${formatMoney(row.amount)} cannot be undone.`,
          onConfirm: () => removeMutation.mutate(row.id),
        }),
    },
  ];

  const columns: IDataTableColumn<ITransaction>[] = [
    {
      title: "Date",
      dataIndex: "txn_date",
      mobile: "title",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Time",
      dataIndex: "created_at",
      mobile: "subtitle",
      className: nowrapCell,
      render: (value: string) => formatTime(value),
    },
    ...(isCompact
      ? [
          {
            title: "Summary",
            key: "summary",
            mobile: "subtitle" as const,
            render: (_: unknown, row: ITransaction) => {
              const summary = summaryOf(row);
              return summary ? <span className={dataCardLine}>{summary}</span> : null;
            },
          },
        ]
      : []),
    {
      title: "Type",
      dataIndex: "type",
      mobile: "status",
      className: nowrapCell,
      render: (type: ITransaction["type"]) => (
        <StatusTag
          color={transactionTypeColors[type]}
          label={transactionTypeLabels[type]}
        />
      ),
    },
    {
      title: "Branch",
      mobile: "hidden",
      dataIndex: "branch",
      collapse: "xl",
      render: branchName,
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            mobile: "hidden" as const,
            key: "user",
            collapse: "2xl" as const,
            skeleton: "avatar" as const,
            render: (_: unknown, row: ITransaction) => (
              <UserCell
                user={row.created_by ? userById.get(row.created_by) : undefined}
              />
            ),
          },
        ]
      : []),
    {
      title: "Amount",
      dataIndex: "amount",
      mobile: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Action",
            key: "actions",
            align: "center" as const,
            className: nowrapCell,
            render: (_: unknown, row: ITransaction) => (
              <RowActionMenu actions={actionsOf(row)} />
            ),
          },
        ]
      : []),
  ];

  const detailSections: IDetailSection<ITransaction>[] = [
    {
      key: "transaction",
      title: "Details",
      icon: <FileText />,
      items: [
        {
          key: "reference",
          label: "Reference",
          render: (row) => row.reference_number,
        },
        {
          key: "branch",
          label: "Branch",
          render: (row) => branchName(row.branch),
        },
        {
          key: "description",
          label: "Description",
          render: (row) => row.description,
        },
        {
          key: "farm_section",
          label: "Farm section",
          render: (row) => row.farm_section,
        },
      ],
    },
    {
      key: "financial",
      title: "Financial details",
      icon: <Wallet />,
      items: [
        {
          key: "cash_account",
          label: "Cash account",
          render: (row) => paymentLabelOf(row),
        },
        {
          key: "income_source",
          label: "Income source",
          render: (row) => incomeSourceLabelOf(row.income_source),
        },
        {
          key: "party",
          label: "Customer or supplier",
          render: (row) => row.customer?.name || row.supplier?.name,
        },
      ],
    },
    {
      key: "audit",
      title: "Audit",
      icon: <History />,
      items: [
        ...(permissions.isManager
          ? [
              {
                key: "recorded_by",
                label: "Recorded by",
                render: (row: ITransaction) => userNameOf(row.created_by),
              },
            ]
          : []),
        {
          key: "recorded_at",
          label: "Recorded at",
          render: (row) => formatDateTime(row.created_at),
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
                <PrimaryAction
                  icon={<Plus />}
                  label="Record transaction"
                  onPress={() => formModal.openModal()}
                />
              </RequirePermission>
            }
          >
            <LedgerFilterBar showType layout="popover" />
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
        <DataTable<ITransaction>
          columns={columns}
          data={transactions}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          pagination={pagination}
          detachedPagination
          totalCount={totalCount}
          onPageChange={goToPage}
          expansionKey={transactionExpansionKey}
          detailSections={detailSections}
          detailTitle={(row) => `${transactionTypeLabels[row.type]} transaction`}
          detailActions={permissions.isManager ? actionsOf : undefined}
          emptyText="No transactions match the current filters"
          emptyHint={filteredEmptyHint}
        />
      </TablePanel>

      <EntityFormModal<ITransactionInput>
        open={formModal.modal.visible}
        title="Record transaction"
        size="lg"
        sections={sections}
        schema={transactionSchema}
        defaultValues={defaults}
        deriveValues={deriveFormValues}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </>
  );
};

export default TransactionsTable;
