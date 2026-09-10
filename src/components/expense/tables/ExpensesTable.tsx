import {
  DeleteOutlined,
  EditOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import DisbursementHistoryModal from "../../disbursement/modal/DisbursementHistoryModal";
import { userRoleLabels } from "../../../enums/role.enum";
import { cashAccountLabels } from "../../../enums/transaction.enum";
import {
  voucherStatusColors,
  voucherStatusLabels,
  voucherTypeLabels,
} from "../../../enums/voucher.enum";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { isDisbursementLocked } from "../../../hook/data/disbursement/disbursement.list.hook";
import { useExpenseListHook } from "../../../hook/data/expense/expense.list.hook";
import { expenseListKey } from "../../../keys/query.keys";
import { disbursementExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  expenseSchema,
  type IDisbursementInput,
} from "../../../models/data/transaction/transaction.request";
import type { IDisbursement } from "../../../models/data/transaction/transaction.response";
import { nowrapCell, typeTag } from "../../../styles/table/table.css";
import { formatDate, formatMoney, formatTime } from "../../../utils/format.utils";

const ExpensesTable = () => {
  const {
    permissions,
    rows,
    totalCount,
    pagination,
    goToPage,
    loading,
    branchName,
    expenseCategoryLabelOf,
    userById,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit,
    auditLoading,
    sections,
    defaults,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  } = useExpenseListHook();

  const openConfirm = useConfirm();

  const payeeOf = (row: IDisbursement) =>
    row.voucher?.payee ?? row.supplier?.name ?? "—";

  const userRoleOf = (row: IDisbursement) => {
    const user = row.created_by ? userById.get(row.created_by) : undefined;
    return user ? userRoleLabels[user.role] : "—";
  };

  const actionsOf = (row: IDisbursement): IRowAction[] => {
    const locked = isDisbursementLocked(row);

    return [
      ...(permissions.encodeTransactions
        ? [
            {
              key: "edit",
              label: locked
                ? "Locked — voucher approved or printed"
                : "Edit expense",
              icon: <EditOutlined />,
              disabled: locked,
              onSelect: () => editModal.openModal(row),
            },
          ]
        : []),
      {
        key: "history",
        label: "Edit history",
        icon: <HistoryOutlined />,
        onSelect: () => historyModal.openModal(row),
      },
      ...(permissions.isManager && !locked
        ? [
            {
              key: "delete",
              label: "Delete expense",
              icon: <DeleteOutlined />,
              danger: true,
              onSelect: () =>
                openConfirm({
                  kind: "delete",
                  title: "Delete expense?",
                  message: `Deleting this expense of ${formatMoney(
                    row.amount
                  )} also deletes its voucher and cannot be undone.`,
                  onConfirm: () => removeMutation.mutate(row.id),
                }),
            },
          ]
        : []),
    ];
  };

  const columns: ColumnsType<IDisbursement> = [
    {
      title: "Date",
      dataIndex: "txn_date",
      className: `${nowrapCell}`,
      render: (value: string) => formatDate(value),
    },
    { title: "Payee", key: "payee", render: (_, row) => payeeOf(row) },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Expense type",
      dataIndex: "expense_type",
      render: (value: IDisbursement["expense_type"]) =>
        expenseCategoryLabelOf(value),
    },
    {
      title: "Voucher",
      key: "voucher_status",
      className: `${nowrapCell}`,
      render: (_, row) =>
        row.voucher ? (
          <Space size="small">
            <Tag
              className={`${typeTag}`}
              color={voucherStatusColors[row.voucher.status]}
              variant="outlined"
            >
              {voucherStatusLabels[row.voucher.status]}
            </Tag>
            {row.voucher.printed ? (
              <Tag className={`${typeTag}`} variant="outlined">
                Printed
              </Tag>
            ) : null}
          </Space>
        ) : (
          <Tag className={`${typeTag}`} variant="outlined">
            Syncing
          </Tag>
        ),
    },
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
            title: "User",
            key: "user",
            render: (_: unknown, row: IDisbursement) =>
              userNameOf(row.created_by),
          },
        ]
      : []),
    {
      title: "Action",
      key: "actions",
      align: "center" as const,
      className: `${nowrapCell}`,
      render: (_: unknown, row: IDisbursement) => (
        <RowActionMenu actions={actionsOf(row)} />
      ),
    },
  ];

  const detailSections: IDetailSection<IDisbursement>[] = [
    {
      key: "expense",
      title: "Expense",
      icon: <FileTextOutlined />,
      items: [
        {
          key: "cash_account",
          label: "Paid from",
          render: (row) =>
            row.cash_account ? cashAccountLabels[row.cash_account] : "—",
        },
        {
          key: "farm_section",
          label: "Farm section",
          render: (row) => row.farm_section || "—",
        },
        {
          key: "description",
          label: "Description",
          render: (row) => row.description || "—",
        },
      ],
    },
    {
      key: "voucher",
      title: "Voucher",
      icon: <FileProtectOutlined />,
      items: [
        {
          key: "voucher_no",
          label: "Voucher no.",
          render: (row) => row.voucher?.voucher_no || "—",
        },
        {
          key: "voucher_type",
          label: "Voucher type",
          render: (row) =>
            row.voucher ? voucherTypeLabels[row.voucher.type] : "—",
        },
        {
          key: "printed",
          label: "Printed",
          render: (row) => (row.voucher?.printed ? "Yes" : "No"),
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
                render: (row: IDisbursement) => userNameOf(row.created_by),
              },
              {
                key: "role",
                label: "Role",
                render: (row: IDisbursement) => userRoleOf(row),
              },
              {
                key: "recorded_at",
                label: "Recorded at",
                render: (row: IDisbursement) => formatTime(row.created_at),
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
            actions={
              <RequirePermission can="encodeTransactions" fallback={null}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => formModal.openModal()}
                >
                  Record expense
                </Button>
              </RequirePermission>
            }
          >
            <LedgerFilterBar />
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
        <DataTable<IDisbursement>
          columns={columns}
          data={rows}
          loading={loading}
          pagination={pagination}
          detachedPagination
          expansionKey={disbursementExpansionKey(expenseListKey)}
          detailSections={detailSections}
          emptyText="No expenses match the current filters"
        />
      </TablePanel>

      <EntityFormModal<IDisbursementInput>
        open={formModal.modal.visible}
        title="Record expense"
        subtitle="Enter the details of the expense. A voucher is generated automatically."
        size="lg"
        sections={sections}
        schema={expenseSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      {editDefaults ? (
        <EntityFormModal<IDisbursementInput>
          open={editModal.modal.visible}
          title="Edit expense"
          subtitle="Update the details of this expense."
          size="lg"
          sections={sections}
          schema={expenseSchema}
          defaultValues={editDefaults}
          submitting={updateMutation.loading}
          onSubmit={(values) => {
            if (editRow) void updateMutation.mutate({ id: editRow.id, values });
          }}
          onClose={editModal.closeModal}
        />
      ) : null}

      <DisbursementHistoryModal
        open={historyModal.modal.visible}
        row={historyRow}
        audit={audit}
        loading={auditLoading}
        userNameOf={userNameOf}
        onClose={historyModal.closeModal}
      />
    </>
  );
};

export default ExpensesTable;
