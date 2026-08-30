import { PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionCard from "../../components/common/card/SectionCard";
import LedgerFilterBar from "../../components/common/filter/LedgerFilterBar";
import EntityFormModal from "../../components/common/form/EntityFormModal";
import RequirePermission from "../../components/common/guard/RequirePermission";
import DataTable from "../../components/common/table/DataTable";
import ContentView from "../../components/common/view/ContentView";
import { userRoleLabels } from "../../enums/role.enum";
import { transactionTypeLabels } from "../../enums/transaction.enum";
import { useTransactionListHook } from "../../hook/data/transaction/transaction.list.hook";
import {
  transactionSchema,
  type ITransactionInput,
} from "../../models/data/transaction/transaction.request";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import {
  formatDate,
  formatMoney,
  formatTime,
} from "../../utils/format.utils";

const TransactionsView = () => {
  const {
    permissions,
    transactions,
    loading,
    branchName,
    userById,
    formModal,
    fields,
    defaults,
    createMutation,
    removeMutation,
  } = useTransactionListHook();

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
              <Popconfirm
                title="Delete this transaction?"
                onConfirm={() => void removeMutation.mutate(row.id)}
              >
                <Button type="link" danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <ContentView
      title="Transactions"
      subtitle="Sales, expenses, payments, purchases and collections"
      meta={`${transactions.length} ${transactions.length === 1 ? "record" : "records"}`}
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
      <SectionCard dense>
        <LedgerFilterBar />
      </SectionCard>

      <DataTable<ITransaction>
        columns={columns}
        data={transactions}
        loading={loading}
        emptyText="No transactions match the current filters"
      />

      <EntityFormModal<ITransactionInput>
        open={formModal.modal.open}
        title="Record transaction"
        fields={fields}
        schema={transactionSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </ContentView>
  );
};

export default TransactionsView;
