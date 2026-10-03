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
import { useBankAccountManageHook } from "../../../hook/data/bank/bank.account.manage.hook";
import type { IRowAction } from "../../../models/common/action.model";
import {
  bankAccountSchema,
  type IBankAccountInput,
} from "../../../models/data/bank/bank.request";
import type { IBankAccount } from "../../../models/data/bank/bank.response";
import { nowrapCell } from "../../../styles/table/table.styles";

const BankAccountsTable = () => {
  const {
    bankAccounts,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    retry,
    editing,
    fields,
    createModal,
    editModal,
    createDefaults,
    editDefaults,
    createMutation,
    updateMutation,
    confirmArchive,
    confirmRestore,
    confirmRemove,
  } = useBankAccountManageHook();

  const actionsOf = (account: IBankAccount): IRowAction[] => [
    {
      key: "edit",
      label: "Edit account",
      icon: <Pencil />,
      onSelect: () => editModal.openModal(account),
    },
    account.active
      ? {
          key: "archive",
          label: "Archive account",
          icon: <Archive />,
          onSelect: () => confirmArchive(account),
        }
      : {
          key: "restore",
          label: "Restore account",
          icon: <Undo2 />,
          onSelect: () => confirmRestore(account),
        },
    {
      key: "delete",
      label: "Delete account",
      icon: <Trash2 />,
      danger: true,
      onSelect: () => confirmRemove(account),
    },
  ];

  const columns: IDataTableColumn<IBankAccount>[] = [
    {
      title: "Bank",
      key: "bank",
      skeleton: "avatar",
      render: (_, account) => <AvatarCell name={account.bank?.name ?? "—"} />,
    },
    { title: "Account name", dataIndex: "account_name" },
    {
      title: "Account number",
      dataIndex: "account_number",
      className: nowrapCell,
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
      render: (_, account) => <RowActionMenu actions={actionsOf(account)} />,
    },
  ];

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar>
            <SearchInput
              placeholder="Search bank accounts"
              value={search}
              onChange={(term) => setSearch(term ?? "")}
            />
          </FilterToolbar>
        }
      >
        <DataTable<IBankAccount>
          columns={columns}
          data={bankAccounts}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          rowKey="id"
          emptyText={search ? "No bank accounts match your search" : "No bank accounts yet"}
          emptyHint={search ? searchEmptyHint : firstRecordHint}
        />
      </TablePanel>

      <EntityFormModal<IBankAccountInput>
        open={createModal.modal.visible}
        title="Add bank account"
        fields={fields}
        schema={bankAccountSchema}
        defaultValues={createDefaults}
        submitting={createMutation.loading}
        submitText="Add account"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={createModal.closeModal}
      />

      <EntityFormModal<IBankAccountInput>
        open={editModal.modal.visible}
        title={`Edit ${editing?.account_name ?? "account"}`}
        fields={fields}
        schema={bankAccountSchema}
        defaultValues={editDefaults}
        submitting={updateMutation.loading}
        onSubmit={(values) => {
          if (editing)
            void updateMutation.mutate({ id: editing.id, values });
        }}
        onClose={editModal.closeModal}
      />
    </>
  );
};

export default BankAccountsTable;
