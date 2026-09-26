import { Archive, Pencil, Plus, Trash2, Undo2, Wallet } from "lucide-react";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import { useExpenseCategoryManageHook } from "../../hook/data/expense-category/expense.category.manage.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import {
  expenseCategorySchema,
  type IExpenseCategoryInput,
} from "../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import AppButton from "../common/button/AppButton";
import SectionCard from "../common/card/SectionCard";
import EntityFormModal from "../common/form/EntityFormModal";
import StatusTag from "../common/status/StatusTag";
import DataTable from "../common/table/DataTable";
import { NameCell, RowActions } from "../common/table/TableDecor";

const fields: IFieldConfig<IExpenseCategoryInput>[] = [
  {
    name: "name",
    label: "Category name",
    type: "text",
    placeholder: "e.g. Fuel",
  },
  {
    name: "code",
    label: "Voucher code (3 letters)",
    type: "text",
    placeholder: "e.g. FUE",
  },
  { name: "sort", label: "Sort order", type: "number" },
];

const ExpenseCategoriesPanel = () => {
  const {
    expenseCategories,
    loading,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    setActiveMutation,
    removeMutation,
  } = useExpenseCategoryManageHook();

  const openConfirm = useConfirm();

  const columns: IDataTableColumn<IExpenseCategory>[] = [
    {
      title: "Category",
      dataIndex: "name",
      render: (name: string) => (
        <NameCell icon={<Wallet />}>{name}</NameCell>
      ),
    },
    {
      title: "Voucher code",
      dataIndex: "code",
      width: 150,
      render: (value: string) => <StatusTag label={value} />,
    },
    { title: "Order", dataIndex: "sort", width: 90, align: "center" },
    {
      title: "Status",
      dataIndex: "active",
      width: 120,
      align: "center",
      render: (active: boolean) =>
        active ? (
          <StatusTag color="positive" label="Active" />
        ) : (
          <StatusTag label="Archived" />
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, category) => (
        <RowActions>
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
            tooltip="Edit category"
            onPress={() => editModal.openModal(category)}
          >
            <Pencil />
          </AppButton>
          {category.active ? (
            <AppButton
              variant="outline"
              size="icon-sm"
              aria-label={`Archive ${category.name}`}
              tooltip="Archive category"
              onPress={() =>
                openConfirm({
                  title: `Archive ${category.name}?`,
                  message:
                    "It stops appearing on the expense form but past expenses keep it.",
                  onConfirm: () =>
                    setActiveMutation.mutate({
                      slug: category.slug,
                      active: false,
                    }),
                })
              }
            >
              <Archive />
            </AppButton>
          ) : (
            <AppButton
              variant="outline"
              size="icon-sm"
              aria-label={`Restore ${category.name}`}
              tooltip="Restore category"
              onPress={() =>
                void setActiveMutation.mutate({
                  slug: category.slug,
                  active: true,
                })
              }
            >
              <Undo2 />
            </AppButton>
          )}
          <AppButton
            variant="destructive"
            size="icon-sm"
            aria-label={`Delete ${category.name}`}
            tooltip="Delete category"
            onPress={() =>
              openConfirm({
                kind: "delete",
                title: `Delete ${category.name}?`,
                message:
                  "Only possible while no expense uses it — otherwise archive it.",
                onConfirm: () => removeMutation.mutate(category.slug),
              })
            }
          >
            <Trash2 />
          </AppButton>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <SectionCard
        title="Expense Categories"
        subtitle="Options on the expense form — each owns its voucher numbering code"
        extra={
          <AppButton onPress={() => createModal.openModal()}>
            <Plus />
            Add category
          </AppButton>
        }
        flush
      >
        <DataTable<IExpenseCategory>
          columns={columns}
          data={expenseCategories}
          loading={loading}
          rowKey="slug"
          emptyText="No expense categories yet — add your first one"
        />
      </SectionCard>

      <EntityFormModal<IExpenseCategoryInput>
        open={createModal.modal.visible}
        title="Add expense category"
        fields={fields}
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
        fields={fields}
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

export default ExpenseCategoriesPanel;
