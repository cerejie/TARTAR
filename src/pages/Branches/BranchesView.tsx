import {
  FileText,
  Landmark,
  Pencil,
  Plus,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
  UserRound,
  Wallet,
} from "lucide-react";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { IDataTableColumn } from "../../models/common/table.model";
import AppButton from "../../components/common/button/AppButton";
import SectionCard from "../../components/common/card/SectionCard";
import EntityFormModal from "../../components/common/form/EntityFormModal";
import StatusTag from "../../components/common/status/StatusTag";
import DataTable from "../../components/common/table/DataTable";
import {
  ColumnLabel,
  NameCell,
  RowActions,
} from "../../components/common/table/TableDecor";
import ContentView from "../../components/common/view/ContentView";
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

  const openConfirm = useConfirm();

  const columns: IDataTableColumn<IBranch>[] = [
    {
      title: "Branch Name",
      dataIndex: "name",
      render: (name: string) => (
        <NameCell icon={<Store />}>{name}</NameCell>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      width: 160,
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
      width: 120,
      align: "center",
      render: (_, branch) => (
        <RowActions>
          <AppButton
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${branch.name}`}
            tooltip="Edit branch"
            onPress={() => editModal.openModal(branch)}
          >
            <Pencil />
          </AppButton>
          {branch.active ? (
            <AppButton
              variant="destructive"
              size="icon-sm"
              aria-label={`Archive ${branch.name}`}
              tooltip="Archive branch"
              onPress={() =>
                openConfirm({
                  title: `Archive ${branch.name}?`,
                  message:
                    "It is hidden from selectors but its history is kept.",
                  onConfirm: () =>
                    setActiveMutation.mutate({
                      slug: branch.slug,
                      active: false,
                    }),
                })
              }
            >
              <Trash2 />
            </AppButton>
          ) : (
            <AppButton
              variant="outline"
              size="icon-sm"
              aria-label={`Restore ${branch.name}`}
              tooltip="Restore branch"
              onPress={() =>
                void setActiveMutation.mutate({
                  slug: branch.slug,
                  active: true,
                })
              }
            >
              <Undo2 />
            </AppButton>
          )}
        </RowActions>
      ),
    },
  ];

  const monitorColumns: IDataTableColumn<IBranchMonitorRow>[] = [
    {
      title: <ColumnLabel icon={<Landmark />}>Branch</ColumnLabel>,
      dataIndex: "branchName",
      render: (name: string) => (
        <NameCell icon={<Store />}>{name}</NameCell>
      ),
    },
    {
      title: <ColumnLabel icon={<Wallet />}>Cash Balance</ColumnLabel>,
      dataIndex: "cashBalance",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<TrendingUp />}>Sales</ColumnLabel>,
      dataIndex: "sales",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<TrendingDown />}>Expenses</ColumnLabel>,
      dataIndex: "expenses",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<UserRound />}>Receivables</ColumnLabel>,
      dataIndex: "receivables",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: <ColumnLabel icon={<FileText />}>Payables</ColumnLabel>,
      dataIndex: "payables",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
  ];

  return (
    <ContentView
      actions={
        <AppButton onPress={() => createModal.openModal()}>
          <Plus />
          Add Branch
        </AppButton>
      }
    >
      <SectionCard
        title="Branches"
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
        open={createModal.modal.visible}
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
        open={editModal.modal.visible}
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
    </ContentView>
  );
};

export default BranchesView;
