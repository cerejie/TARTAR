import { Archive, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  firstRecordHint,
  searchEmptyHint,
} from "../../../models/common/table.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import FilterToolbar from "../../common/filter/FilterToolbar";
import SearchInput from "../../common/filter/SearchInput";
import EntityFormModal from "../../common/form/EntityFormModal";
import StatusTag from "../../common/status/StatusTag";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import {
  incomeSourceFormFields,
  useIncomeSourceManageHook,
} from "../../../hook/data/income-source/income.source.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import {
  incomeSourceSchema,
  type IIncomeSourceInput,
} from "../../../models/data/income-source/income.source.request";
import type { IIncomeSource } from "../../../models/data/income-source/income.source.response";
import { nowrapCell } from "../../../styles/table/table.styles";

const IncomeSourcesTable = () => {
  const {
    incomeSources,
    search,
    setSearch,
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
  } = useIncomeSourceManageHook();

  const actionsOf = (source: IIncomeSource): IRowAction[] => [
    {
      key: "edit",
      label: "Edit income source",
      icon: <Pencil />,
      onSelect: () => editModal.openModal(source),
    },
    source.active
      ? {
          key: "archive",
          label: "Archive income source",
          icon: <Archive />,
          onSelect: () => confirmArchive(source),
        }
      : {
          key: "restore",
          label: "Restore income source",
          icon: <Undo2 />,
          onSelect: () => confirmRestore(source),
        },
    {
      key: "delete",
      label: "Delete income source",
      icon: <Trash2 />,
      danger: true,
      onSelect: () => confirmRemove(source),
    },
  ];

  const columns: IDataTableColumn<IIncomeSource>[] = [
    {
      title: "Income source",
      dataIndex: "name",
      skeleton: "avatar",
      render: (name: string) => <AvatarCell name={name} />,
    },
    { title: "Order", dataIndex: "sort", align: "center" },
    {
      title: "Status",
      mobile: "status",
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
      render: (_, source) => <RowActionMenu actions={actionsOf(source)} />,
    },
  ];

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar>
            <SearchInput
              placeholder="Search income sources"
              value={search}
              onChange={(term) => setSearch(term ?? "")}
            />
          </FilterToolbar>
        }
      >
        <DataTable<IIncomeSource>
          columns={columns}
          data={incomeSources}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          rowKey="slug"
          emptyText={search ? "No income sources match your search" : "No income sources yet"}
          emptyHint={search ? searchEmptyHint : firstRecordHint}
        />
      </TablePanel>

      <EntityFormModal<IIncomeSourceInput>
        open={createModal.modal.visible}
        title="Add income source"
        fields={incomeSourceFormFields}
        schema={incomeSourceSchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Add income source"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IIncomeSourceInput>
        open={editModal.modal.visible}
        title={`Edit ${editing?.name ?? "income source"}`}
        fields={incomeSourceFormFields}
        schema={incomeSourceSchema}
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

export default IncomeSourcesTable;
