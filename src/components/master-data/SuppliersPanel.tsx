import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useConfirm } from "../../hook/common/confirmation.hook";
import type { ColumnsType } from "antd/es/table";
import { useSupplierManageHook } from "../../hook/data/party/supplier.manage.hook";
import type { IFieldConfig } from "../../models/common/field.model";
import {
  partySchema,
  type IPartyInput,
} from "../../models/data/party/party.request";
import type { ISupplier } from "../../models/data/party/party.response";
import { iconButton } from "../../styles/table/table.css";
import SectionCard from "../common/card/SectionCard";
import EntityFormModal from "../common/form/EntityFormModal";
import DataTable from "../common/table/DataTable";
import { NameCell, RowActions } from "../common/table/TableDecor";

const fields: IFieldConfig<IPartyInput>[] = [
  {
    name: "name",
    label: "Supplier name",
    type: "text",
    placeholder: "e.g. Cebu Steel Trading",
  },
  {
    name: "contact_person",
    label: "Contact person",
    type: "text",
    placeholder: "Who to ask for",
  },
  {
    name: "contact",
    label: "Contact number",
    type: "text",
    placeholder: "e.g. 0917 123 4567",
  },
  { name: "address", label: "Address", type: "textarea" },
];

const SuppliersPanel = () => {
  const {
    suppliers,
    loading,
    editing,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  } = useSupplierManageHook();

  const openConfirm = useConfirm();

  const columns: ColumnsType<ISupplier> = [
    {
      title: "Supplier",
      dataIndex: "name",
      render: (name: string) => (
        <NameCell icon={<ShopOutlined />}>{name}</NameCell>
      ),
    },
    {
      title: "Contact person",
      dataIndex: "contact_person",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Contact number",
      dataIndex: "contact",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (value: string | null) => value || "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, supplier) => (
        <RowActions>
          <Tooltip title="Edit supplier">
            <Button
              className={`${iconButton}`}
              icon={<EditOutlined />}
              aria-label={`Edit ${supplier.name}`}
              onClick={() => editModal.openModal(supplier)}
            />
          </Tooltip>
          <Tooltip title="Delete supplier">
            <Button
              className={`${iconButton}`}
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${supplier.name}`}
              onClick={() =>
                openConfirm({
                  kind: "delete",
                  title: `Delete ${supplier.name}?`,
                  message: "Only possible while no record references it.",
                  onConfirm: () => removeMutation.mutate(supplier.id),
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
        title="Suppliers"
        subtitle="Master records offered by every supplier selector in the app"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createModal.openModal()}
          >
            Add supplier
          </Button>
        }
        flush
      >
        <DataTable<ISupplier>
          columns={columns}
          data={suppliers}
          loading={loading}
          emptyText="No suppliers yet — add your first one"
        />
      </SectionCard>

      <EntityFormModal<IPartyInput>
        open={createModal.modal.visible}
        title="Add supplier"
        fields={fields}
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
        fields={fields}
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

export default SuppliersPanel;
