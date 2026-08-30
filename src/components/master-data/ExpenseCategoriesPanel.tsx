import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  UndoOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Badge, Button, Tag, Tooltip } from "antd";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { ColumnsType } from "antd/es/table";
import { useExpenseCategoryManageHook } from "../../hook/data/expense-category/expense.category.manage.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import {
  expenseCategorySchema,
  type IExpenseCategoryInput,
} from "../../models/data/expense-category/expense.category.request";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import { iconButton, slugTag } from "../../styles/table/table.css";
import SectionCard from "../common/card/SectionCard";
import EntityFormModal from "../common/form/EntityFormModal";
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

  const columns: ColumnsType<IExpenseCategory> = [
    {
      title: "Category",
      dataIndex: "name",
      render: (name: string) => (
        <NameCell icon={<WalletOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: "Voucher code",
      dataIndex: "code",
      width: 150,
      render: (value: string) => <Tag className={`${slugTag}`}>{value}</Tag>,
    },
    { title: "Order", dataIndex: "sort", width: 90, align: "center" },
    {
      title: "Status",
      dataIndex: "active",
      width: 120,
      align: "center",
      render: (active: boolean) =>
        active ? (
          <Badge status="success" text="Active" />
        ) : (
          <Badge status="default" text="Archived" />
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, category) => (
        <RowActions>
          <Tooltip title="Edit category">
            <Button
              className={`${iconButton}`}
              icon={<EditOutlined />}
              aria-label={`Edit ${category.name}`}
              onClick={() => editModal.openModal(category)}
            />
          </Tooltip>
          {category.active ? (
            <Tooltip title="Archive category">
              <Button
                className={`${iconButton}`}
                icon={<InboxOutlined />}
                aria-label={`Archive ${category.name}`}
                onClick={() =>
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
              />
            </Tooltip>
          ) : (
            <Tooltip title="Restore category">
              <Button
                className={`${iconButton}`}
                icon={<UndoOutlined />}
                aria-label={`Restore ${category.name}`}
                onClick={() =>
                  void setActiveMutation.mutate({
                    slug: category.slug,
                    active: true,
                  })
                }
              />
            </Tooltip>
          )}
          <Tooltip title="Delete category">
            <Button
              className={`${iconButton}`}
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${category.name}`}
              onClick={() =>
                openConfirm({
                  kind: "delete",
                  title: `Delete ${category.name}?`,
                  message:
                    "Only possible while no expense uses it — otherwise archive it.",
                  onConfirm: () => removeMutation.mutate(category.slug),
                })
              }
            />
          </Tooltip>
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createModal.openModal()}
          >
            Add category
          </Button>
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
