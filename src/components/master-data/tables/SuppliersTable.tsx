import { Pencil, Trash2 } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import EntityFormModal from "../../common/form/EntityFormModal";
import AvatarCell from "../../common/table/AvatarCell";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePanel from "../../common/table/TablePanel";
import {
  supplierFormFields,
  useSupplierManageHook,
} from "../../../hook/data/party/supplier.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import {
  partySchema,
  type IPartyInput,
} from "../../../models/data/party/party.request";
import type { ISupplier } from "../../../models/data/party/party.response";
import { nowrapCell } from "../../../styles/table/table.styles";

const SuppliersTable = () => {
  const {
    suppliers,
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
    confirmRemove,
  } = useSupplierManageHook();

  const actionsOf = (supplier: ISupplier): IRowAction[] => [
    {
      key: "edit",
      label: "Edit supplier",
      icon: <Pencil />,
      onSelect: () => editModal.openModal(supplier),
    },
    {
      key: "delete",
      label: "Delete supplier",
      icon: <Trash2 />,
      danger: true,
      onSelect: () => confirmRemove(supplier),
    },
  ];

  const columns: IDataTableColumn<ISupplier>[] = [
    {
      title: "Supplier",
      dataIndex: "name",
      skeleton: "avatar",
      render: (name: string, supplier) => (
        <AvatarCell name={name} hint={supplier.contact_person ?? undefined} />
      ),
    },
    {
      title: "Contact number",
      dataIndex: "contact",
      className: nowrapCell,
      render: (value: string | null) => value || "—",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, supplier) => <RowActionMenu actions={actionsOf(supplier)} />,
    },
  ];

  return (
    <>
      <TablePanel>
        <DataTable<ISupplier>
          columns={columns}
          data={suppliers}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          emptyText="No suppliers yet — add your first one"
        />
      </TablePanel>

      <EntityFormModal<IPartyInput>
        open={createModal.modal.visible}
        title="Add supplier"
        fields={supplierFormFields}
        schema={partySchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Add supplier"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IPartyInput>
        open={editModal.modal.visible}
        title={`Edit ${editing?.name ?? "supplier"}`}
        fields={supplierFormFields}
        schema={partySchema}
        defaultValues={editDefaults}
        submitting={updateMutation.loading}
        onSubmit={(values) => {
          if (editing) void updateMutation.mutate({ id: editing.id, values });
        }}
        onClose={editModal.closeModal}
      />
    </>
  );
};

export default SuppliersTable;
