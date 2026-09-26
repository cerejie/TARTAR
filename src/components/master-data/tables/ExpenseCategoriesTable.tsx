import { Archive, Pencil, Trash2, Undo2 } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import EntityFormModal from "../../common/form/EntityFormModal";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import {
  expenseCategoryFormFields,
  useExpenseCategoryManageHook,
} from "../../../hook/data/expense-category/expense.category.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import {
  expenseCategorySchema,
  type IExpenseCategoryInput,
} from "../../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../../models/data/expense-category/expense.category.response";
import { nowrapCell } from "../../../styles/table/table.styles";

const ExpenseCategoriesTable = () => {
  const {
    expenseCategories,
    loading,
    refreshing,
    error,
    retry,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    confirmArchive,
    confirmRestore,
    confirmRemove,
  } = useExpenseCategoryManageHook();

  const actionsOf = (category: IExpenseCategory): IRowAction[] => [
    {
      key: "edit",
      label: "Edit category",
      icon: <Pencil />,
      onSelect: () => editModal.openModal(category),
    },
    category.active
      ? {
          key: "archive",
          label: "Archive category",
          icon: <Archive />,
          onSelect: () => confirmArchive(category),
        }
      : {
          key: "restore",
          label: "Restore category",
          icon: <Undo2 />,
          onSelect: () => confirmRestore(category),
        },
    {
      key: "delete",
      label: "Delete category",
      icon: <Trash2 />,
      danger: true,
      onSelect: () => confirmRemove(category),
    },
  ];

  const columns: IDataTableColumn<IExpenseCategory>[] = [
    {
      title: "Category",
      dataIndex: "name",
      skeleton: "avatar",
      render: (name: string) => <AvatarCell name={name} />,
    },
    {
      title: "Voucher code",
      dataIndex: "code",
      className: nowrapCell,
      render: (value: string) => <StatusTag label={value} />,
    },
    { title: "Order", dataIndex: "sort", align: "center" },
    {
      title: "Status",
      dataIndex: "active",
      className: nowrapCell,
      render: (active: boolean) =>
        active ? (
          <StatusTag color="positive" label="Active" />
        ) : (
          <StatusTag label="Archived" />
        ),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, category) => <RowActionMenu actions={actionsOf(category)} />,
    },
  ];

  return (
    <>
      <TablePanel>
        <DataTable<IExpenseCategory>
          columns={columns}
          data={expenseCategories}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          rowKey="slug"
          emptyText="No expense categories yet — add your first one"
        />
      </TablePanel>

      <EntityFormModal<IExpenseCategoryInput>
        open={createModal.modal.visible}
        title="Add expense category"
        fields={expenseCategoryFormFields}
        schema={expenseCategorySchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Add category"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IExpenseCategoryInput>
        open={editModal.modal.visible}
        title={`Edit ${editing?.name ?? "category"}`}
        fields={expenseCategoryFormFields}
        schema={expenseCategorySchema}
        defaultValues={editDefaults}
        submitting={updateMutation.loading}
        onSubmit={(values) => {
          if (editing)
            void updateMutation.mutate({ slug: editing.slug, values });
        }}
        onClose={editModal.closeModal}
      />
    </>
  );
};

export default ExpenseCategoriesTable;
