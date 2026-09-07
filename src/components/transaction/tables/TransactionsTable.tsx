import {
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionCard from "../../common/card/SectionCard";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
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
import { nowrapCell, typeTag } from "../../../styles/table/table.css";
import { formatDate, formatMoney, formatTime } from "../../../utils/format.utils";

const TransactionsTable = () => {
  const {
    permissions,
    transactions,
    totalCount,
    pagination,
    goToPage,
    loading,
    branchName,
    userById,
    formModal,
    fields,
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
      icon: <DeleteOutlined />,
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

  const columns: ColumnsType<ITransaction> = [
    {
      title: "Date",
      dataIndex: "txn_date",
      className: `${nowrapCell}`,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Time",
      dataIndex: "created_at",
      className: `${nowrapCell}`,
      render: (value: string) => formatTime(value),
    },
    {
      title: "Type",
      dataIndex: "type",
      className: `${nowrapCell}`,
      render: (type: ITransaction["type"]) => (
        <Tag
          className={`${typeTag}`}
          color={transactionTypeColors[type]}
          variant="outlined"
        >
          {transactionTypeLabels[type]}
        </Tag>
      ),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    ...(permissions.isManager
      ? [
          {
            title: "User",
            key: "user",
            render: (_: unknown, row: ITransaction) => userNameOf(row),
          },
          {
            title: "Role",
            key: "role",
            render: (_: unknown, row: ITransaction) => userRoleOf(row),
          },
        ]
      : []),
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      className: `${nowrapCell}`,
      render: (value: number) => formatMoney(value),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Action",
            key: "actions",
            align: "center" as const,
            className: `${nowrapCell}`,
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
      icon: <FileTextOutlined />,
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
      icon: <TagOutlined />,
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
            icon: <UserOutlined />,
            items: [
              {
                key: "recorded_by",
                label: "Recorded by",
                render: (row: ITransaction) => userNameOf(row),
              },
              {
                key: "role",
                label: "Role",
                render: (row: ITransaction) => {
                  const user = userOf(row);
                  return user ? userRoleLabels[user.role] : "—";
                },
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <SectionCard>
        <FilterToolbar
          actions={
            <RequirePermission can="encodeTransactions" fallback={null}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => formModal.openModal()}
              >
                Record transaction
              </Button>
            </RequirePermission>
          }
        >
          <LedgerFilterBar />
        </FilterToolbar>
      </SectionCard>
        <DataTable<ITransaction>
          columns={columns}
          data={transactions}
          loading={loading}
          pagination={pagination}
          detachedPagination
          expansionKey={transactionExpansionKey}
          detailSections={detailSections}
          emptyText="No transactions match the current filters"
        />

      <TablePagination
        pagination={pagination}
        totalCount={totalCount}
        onPageChange={goToPage}
      />

      <EntityFormModal<ITransactionInput>
        open={formModal.modal.visible}
        title="Record transaction"
        fields={fields}
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
