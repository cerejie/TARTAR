import { Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import EntityFormModal from "../../common/form/EntityFormModal";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import {
  branchFormFields,
  useBranchManageHook,
} from "../../../hook/data/branch/branch.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import {
  branchSchema,
  type IBranchInput,
} from "../../../models/data/branch/branch.request";
import type { IBranch } from "../../../models/data/branch/branch.response";
import { nowrapCell } from "../../../styles/table/table.styles";

const BranchesTable = () => {
  const {
    allBranches,
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
  } = useBranchManageHook();

  const actionsOf = (branch: IBranch): IRowAction[] => [
    {
      key: "edit",
      label: "Edit branch",
      icon: <Pencil />,
      onSelect: () => editModal.openModal(branch),
    },
    branch.active
      ? {
          key: "archive",
          label: "Archive branch",
          icon: <Trash2 />,
          danger: true,
          onSelect: () => confirmArchive(branch),
        }
      : {
          key: "restore",
          label: "Restore branch",
          icon: <Undo2 />,
          onSelect: () => confirmRestore(branch),
        },
  ];

  const columns: IDataTableColumn<IBranch>[] = [
    {
      title: "Branch",
      dataIndex: "name",
      skeleton: "avatar",
      render: (name: string, branch) => (
        <AvatarCell name={name} hint={branch.slug} />
      ),
    },
    {
      title: "Voucher prefix",
      dataIndex: "voucher_prefix",
      className: nowrapCell,
      render: (value: string) => value || "—",
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
      render: (_, branch) => <RowActionMenu actions={actionsOf(branch)} />,
    },
  ];

  return (
    <>
      <TablePanel
        title="Branches"
        toolbar={
          <FilterToolbar
            actions={
              <AppButton onPress={() => createModal.openModal()}>
                <Plus />
                Add branch
              </AppButton>
            }
          />
        }
      >
        <DataTable<IBranch>
          columns={columns}
          data={allBranches}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          rowKey="slug"
          emptyText="No branches yet — add your first one"
        />
      </TablePanel>

      <EntityFormModal<IBranchInput>
        open={createModal.modal.visible}
        title="Add branch"
        subtitle="The voucher prefix starts every voucher number issued by this branch."
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
        subtitle="A new voucher prefix applies to new vouchers only."
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

export default BranchesTable;
