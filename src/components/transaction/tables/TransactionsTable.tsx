import { PlusOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionCard from "../../common/card/SectionCard";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import DataTable from "../../common/table/DataTable";
import TablePagination from "../../common/table/TablePagination";
import { userRoleLabels } from "../../../enums/role.enum";
import { transactionTypeLabels } from "../../../enums/transaction.enum";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { useTransactionListHook } from "../../../hook/data/transaction/transaction.list.hook";
import {
  transactionSchema,
  type ITransactionInput,
} from "../../../models/data/transaction/transaction.request";
import type { ITransaction } from "../../../models/data/transaction/transaction.response";
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

  const columns: ColumnsType<ITransaction> = [
    {
      title: "Date",
      dataIndex: "txn_date",
      width: 130,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Time",
      dataIndex: "created_at",
      width: 100,
      render: (value: string) => formatTime(value),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type: ITransaction["type"]) => (
        <Tag>{transactionTypeLabels[type]}</Tag>
      ),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    ...(permissions.isManager
      ? [
          {
            title: "User",
            key: "user",
            render: (_: unknown, row: ITransaction) => {
              const user = row.created_by
                ? userById.get(row.created_by)
                : undefined;
              return user ? user.full_name || user.username : "—";
            },
          },
          {
            title: "Role",
            key: "role",
            width: 130,
            render: (_: unknown, row: ITransaction) => {
              const user = row.created_by
                ? userById.get(row.created_by)
                : undefined;
              return user ? <Tag>{userRoleLabels[user.role]}</Tag> : "—";
            },
          },
        ]
      : []),
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    ...(permissions.isManager
      ? [
          {
            title: "",
            key: "actions",
            width: 90,
            render: (_: unknown, row: ITransaction) => (
              <Button
                type="link"
                danger
                size="small"
                onClick={() =>
                  openConfirm({
                    kind: "delete",
                    title: "Delete transaction?",
                    message: `Deleting this ${transactionTypeLabels[
                      row.type
                    ].toLowerCase()} of ${formatMoney(
                      row.amount
                    )} cannot be undone.`,
                    onConfirm: () => removeMutation.mutate(row.id),
                  })
                }
              >
                Delete
              </Button>
            ),
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

      <SectionCard flush>
        <DataTable<ITransaction>
          columns={columns}
          data={transactions}
          loading={loading}
          pagination={pagination}
          detachedPagination
          emptyText="No transactions match the current filters"
        />
      </SectionCard>

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
