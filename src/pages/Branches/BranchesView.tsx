import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  FallOutlined,
  FileTextOutlined,
  PlusOutlined,
  RiseOutlined,
  ShopOutlined,
  SolutionOutlined,
  UndoOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Badge, Button, Popconfirm, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import SectionCard from "../../components/common/card/SectionCard";
import EntityFormModal from "../../components/common/form/EntityFormModal";
import DataTable from "../../components/common/table/DataTable";
import {
  ColumnLabel,
  NameCell,
  RowActions,
} from "../../components/common/table/TableDecor";
import PageHeader from "../../components/common/view/PageHeader";
import {
  branchFormFields,
  useBranchManageHook,
} from "../../hook/data/branch/branch.manage.hook";
import {
  branchSchema,
  type IBranchInput,
} from "../../models/data/branch/branch.request";
import type { IBranch } from "../../models/data/branch/branch.response";
import type { IBranchMonitorRow } from "../../models/data/dashboard/dashboard.response";
import { iconButton, slugTag } from "../../styles/table/table.css";
import { formatMoney } from "../../utils/format.utils";

const BranchesView = () => {
  const {
    allBranches,
    loading,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    setActiveMutation,
    monitorRows,
    monitorLoading,
  } = useBranchManageHook();

  const columns: ColumnsType<IBranch> = [
    {
      title: "Branch Name",
      dataIndex: "name",
      render: (name: string) => (
        <NameCell icon={<ShopOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      width: 160,
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
      width: 120,
      align: "center",
      render: (_, branch) => (
        <RowActions>
          <Tooltip title="Edit branch">
            <Button
              className={`${iconButton}`}
              icon={<EditOutlined />}
              aria-label={`Edit ${branch.name}`}
              onClick={() => editModal.openModal(branch.slug)}
            />
          </Tooltip>
          {branch.active ? (
            <Popconfirm
              title="Archive this branch?"
              description="It is hidden from selectors but its history is kept."
              onConfirm={() =>
                void setActiveMutation.mutate({
                  slug: branch.slug,
                  active: false,
                })
              }
            >
              <Tooltip title="Archive branch">
                <Button
                  className={`${iconButton}`}
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Archive ${branch.name}`}
                />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Restore branch">
              <Button
                className={`${iconButton}`}
                icon={<UndoOutlined />}
                aria-label={`Restore ${branch.name}`}
                onClick={() =>
                  void setActiveMutation.mutate({
                    slug: branch.slug,
                    active: true,
                  })
                }
              />
            </Tooltip>
          )}
        </RowActions>
      ),
    },
  ];

  const monitorColumns: ColumnsType<IBranchMonitorRow> = [
    {
      title: <ColumnLabel icon={<BankOutlined />}>Branch</ColumnLabel>,
      dataIndex: "branchName",
      render: (name: string) => (
        <NameCell icon={<ShopOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: <ColumnLabel icon={<WalletOutlined />}>Cash Balance</ColumnLabel>,
      dataIndex: "cashBalance",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<RiseOutlined />}>Sales</ColumnLabel>,
      dataIndex: "sales",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<FallOutlined />}>Expenses</ColumnLabel>,
      dataIndex: "expenses",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<SolutionOutlined />}>Receivables</ColumnLabel>,
      dataIndex: "receivables",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<FileTextOutlined />}>Payables</ColumnLabel>,
      dataIndex: "payables",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
  ];

  return (
    <>
      <PageHeader
        title="Branch Monitoring"
        subtitle="Monitor cash, sales, expenses, receivables and payables per branch"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createModal.openModal()}
          >
            Add Branch
          </Button>
        }
      />

      <SectionCard
        title="Branches"
        subtitle="Add, rename, re-order and archive business units"
        flush
      >
        <DataTable<IBranch>
          columns={columns}
          data={allBranches}
          loading={loading}
          rowKey="slug"
          emptyText="No branches yet — add your first one"
        />
      </SectionCard>

      <SectionCard
        title="Branch Monitoring"
        subtitle="Cash, sales, expenses, receivables and payables per branch"
        flush
      >
        <DataTable<IBranchMonitorRow>
          columns={monitorColumns}
          data={monitorRows}
          loading={monitorLoading}
          rowKey="branch"
          emptyText="No branch data"
        />
      </SectionCard>

      <EntityFormModal<IBranchInput>
        open={createModal.modal.open}
        title="Add branch"
        fields={branchFormFields}
        schema={branchSchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Add branch"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IBranchInput>
        open={editModal.modal.open}
        title={`Edit ${editing?.name ?? "branch"}`}
        fields={branchFormFields}
        schema={branchSchema}
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

export default BranchesView;
