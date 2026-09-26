import { FileText, Plus, Tag, Trash2, User } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import StatusTag from "../../common/status/StatusTag";
import { userRoleLabels } from "../../../enums/role.enum";
import {
  cashAccountLabels,
  incomeSourceLabels,
  transactionTypeColors,
  transactionTypeLabels,
} from "../../../enums/transaction.enum";
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
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatDate, formatMoney, formatTime } from "../../../utils/format.utils";

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
    formModal,
    sections,
    defaults,
    createMutation,
    removeMutation,
  } = useTransactionListHook();

  const openConfirm = useConfirm();

  const userOf = (row: ITransaction) =>
    row.created_by ? userById.get(row.created_by) : undefined;

  const userNameOf = (row: ITransaction) => {
    const user = userOf(row);
    return user ? user.full_name || user.username : "—";
  };

  const userRoleOf = (row: ITransaction) => {
    const user = userOf(row);
    return user ? userRoleLabels[user.role] : "—";
  };

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
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Time",
      dataIndex: "created_at",
      className: nowrapCell,
      render: (value: string) => formatTime(value),
    },
    {
      title: "Type",
      dataIndex: "type",
      className: nowrapCell,
      render: (type: ITransaction["type"]) => (
        <StatusTag
          color={transactionTypeColors[type]}
          label={transactionTypeLabels[type]}
        />
      ),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            key: "user",
            skeleton: "avatar" as const,
            render: (_: unknown, row: ITransaction) => (
              <AvatarCell name={userNameOf(row)} hint={userRoleOf(row)} />
            ),
          },
        ]
      : []),
    {
      title: "Amount",
      dataIndex: "amount",
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
      title: "Transaction",
      icon: <FileText />,
      items: [
        {
          key: "time",
          label: "Time",
          render: (row) => formatTime(row.created_at),
        },
        {
          key: "reference",
          label: "Reference",
          render: (row) => row.reference_number || "—",
        },
        {
          key: "description",
          label: "Description",
          render: (row) => row.description || "—",
        },
      ],
    },
    {
      key: "classification",
      title: "Classification",
      icon: <Tag />,
      items: [
        {
          key: "cash_account",
          label: "Cash account",
          render: (row) =>
            row.cash_account ? cashAccountLabels[row.cash_account] : "—",
        },
        {
          key: "income_source",
          label: "Income source",
          render: (row) =>
            row.income_source ? incomeSourceLabels[row.income_source] : "—",
        },
        {
          key: "party",
          label: "Customer or supplier",
          render: (row) => row.customer?.name || row.supplier?.name || "—",
        },
        {
          key: "farm_section",
          label: "Farm section",
          render: (row) => row.farm_section || "—",
        },
      ],
    },
    ...(permissions.isManager
      ? [
          {
            key: "record",
            title: "Recorded by",
            icon: <User />,
            items: [
              {
                key: "recorded_by",
                label: "Recorded by",
                render: (row: ITransaction) => userNameOf(row),
              },
              {
                key: "role",
                label: "Role",
                render: (row: ITransaction) => userRoleOf(row),
              },
            ],
          },
        ]
      : []),
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
                  Record transaction
                </AppButton>
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
          expansionKey={transactionExpansionKey}
          detailSections={detailSections}
          emptyText="No transactions match the current filters"
        />
      </TablePanel>

      <EntityFormModal<ITransactionInput>
        open={formModal.modal.visible}
        title="Record transaction"
        size="lg"
        sections={sections}
        schema={transactionSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </>
  );
};

export default TransactionsTable;
