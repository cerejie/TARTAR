import { FileCheck, FileText, History, Pencil, Plus, Trash2, User } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import DisbursementHistoryModal from "../../disbursement/modal/DisbursementHistoryModal";
import StatusTag from "../../common/status/StatusTag";
import { userRoleLabels } from "../../../enums/role.enum";
import { cashAccountLabels } from "../../../enums/transaction.enum";
import {
  voucherStatusColors,
  voucherStatusLabels,
  voucherTypeLabels,
} from "../../../enums/voucher.enum";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { isDisbursementLocked } from "../../../hook/data/disbursement/disbursement.list.hook";
import { usePurchaseListHook } from "../../../hook/data/purchase/purchase.list.hook";
import { purchaseListKey } from "../../../keys/query.keys";
import { disbursementExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  purchaseSchema,
  type IDisbursementInput,
} from "../../../models/data/transaction/transaction.request";
import type { IDisbursement } from "../../../models/data/transaction/transaction.response";
import { nowrapCell, tagRow } from "../../../styles/table/table.styles";
import { formatDate, formatMoney, formatTime } from "../../../utils/format.utils";

const PurchasesTable = () => {
  const {
    permissions,
    rows,
    totalCount,
    pagination,
    goToPage,
    loading,
    branchName,
    userById,
    userNameOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit,
    auditLoading,
    sections,
    defaults,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  } = usePurchaseListHook();

  const openConfirm = useConfirm();

  const payeeOf = (row: IDisbursement) =>
    row.voucher?.payee ?? row.supplier?.name ?? "—";

  const userRoleOf = (row: IDisbursement) => {
    const user = row.created_by ? userById.get(row.created_by) : undefined;
    return user ? userRoleLabels[user.role] : "—";
  };

  const actionsOf = (row: IDisbursement): IRowAction[] => {
    const locked = isDisbursementLocked(row);

    return [
      ...(permissions.encodeTransactions
        ? [
            {
              key: "edit",
              label: locked
                ? "Locked — voucher approved or printed"
                : "Edit purchase",
              icon: <Pencil />,
              disabled: locked,
              onSelect: () => editModal.openModal(row),
            },
          ]
        : []),
      {
        key: "history",
        label: "Edit history",
        icon: <History />,
        onSelect: () => historyModal.openModal(row),
      },
      ...(permissions.isManager && !locked
        ? [
            {
              key: "delete",
              label: "Delete purchase",
              icon: <Trash2 />,
              danger: true,
              onSelect: () =>
                openConfirm({
                  kind: "delete",
                  title: "Delete purchase?",
                  message: `Deleting this purchase of ${formatMoney(
                    row.amount
                  )} also deletes its voucher and cannot be undone.`,
                  onConfirm: () => removeMutation.mutate(row.id),
                }),
            },
          ]
        : []),
    ];
  };

  const columns: IDataTableColumn<IDisbursement>[] = [
    {
      title: "Date",
      dataIndex: "txn_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    { title: "Payee", key: "payee", render: (_, row) => payeeOf(row) },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Voucher",
      key: "voucher_status",
      className: nowrapCell,
      render: (_, row) =>
        row.voucher ? (
          <span className={tagRow}>
            <StatusTag
              color={voucherStatusColors[row.voucher.status]}
              label={voucherStatusLabels[row.voucher.status]}
            />
            {row.voucher.printed ? <StatusTag label="Printed" /> : null}
          </span>
        ) : (
          <StatusTag label="Syncing" />
        ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Due date",
      dataIndex: "due_date",
      className: nowrapCell,
      render: (value: string | null) => (value ? formatDate(value) : "Paid"),
    },
    ...(permissions.isManager
      ? [
          {
            title: "User",
            key: "user",
            render: (_: unknown, row: IDisbursement) =>
              userNameOf(row.created_by),
          },
        ]
      : []),
    {
      title: "Action",
      key: "actions",
      align: "center" as const,
      className: nowrapCell,
      render: (_: unknown, row: IDisbursement) => (
        <RowActionMenu actions={actionsOf(row)} />
      ),
    },
  ];

  const detailSections: IDetailSection<IDisbursement>[] = [
    {
      key: "purchase",
      title: "Purchase",
      icon: <FileText />,
      items: [
        {
          key: "reference",
          label: "Reference",
          render: (row) => row.reference_number || "—",
        },
        {
          key: "cash_account",
          label: "Paid from",
          render: (row) =>
            row.cash_account ? cashAccountLabels[row.cash_account] : "—",
        },
        {
          key: "farm_section",
          label: "Farm section",
          render: (row) => row.farm_section || "—",
        },
        {
          key: "description",
          label: "Description",
          render: (row) => row.description || "—",
        },
      ],
    },
    {
      key: "voucher",
      title: "Voucher",
      icon: <FileCheck />,
      items: [
        {
          key: "voucher_no",
          label: "Voucher no.",
          render: (row) => row.voucher?.voucher_no || "—",
        },
        {
          key: "voucher_type",
          label: "Voucher type",
          render: (row) =>
            row.voucher ? voucherTypeLabels[row.voucher.type] : "—",
        },
        {
          key: "printed",
          label: "Printed",
          render: (row) => (row.voucher?.printed ? "Yes" : "No"),
        },
      ],
    },
    ...(permissions.isManager
      ? [
          {
            key: "record",
            title: "Recorded by",
            icon: <User />,
            items: [
              {
                key: "recorded_by",
                label: "Recorded by",
                render: (row: IDisbursement) => userNameOf(row.created_by),
              },
              {
                key: "role",
                label: "Role",
                render: (row: IDisbursement) => userRoleOf(row),
              },
              {
                key: "recorded_at",
                label: "Recorded at",
                render: (row: IDisbursement) => formatTime(row.created_at),
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar
            actions={
              <RequirePermission can="encodeTransactions" fallback={null}>
                <AppButton onPress={() => formModal.openModal()}>
                  <Plus />
                  Record purchase
                </AppButton>
              </RequirePermission>
            }
          >
            <LedgerFilterBar />
          </FilterToolbar>
        }
        footer={
          <TablePagination
            pagination={pagination}
            totalCount={totalCount}
            onPageChange={goToPage}
          />
        }
      >
        <DataTable<IDisbursement>
          columns={columns}
          data={rows}
          loading={loading}
          pagination={pagination}
          detachedPagination
          expansionKey={disbursementExpansionKey(purchaseListKey)}
          detailSections={detailSections}
          emptyText="No purchases match the current filters"
        />
      </TablePanel>

      <EntityFormModal<IDisbursementInput>
        open={formModal.modal.visible}
        title="Record purchase"
        subtitle="Enter the details of the purchase. A voucher is generated automatically."
        size="lg"
        sections={sections}
        schema={purchaseSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      {editDefaults ? (
        <EntityFormModal<IDisbursementInput>
          open={editModal.modal.visible}
          title="Edit purchase"
          subtitle="Update the details of this purchase."
          size="lg"
          sections={sections}
          schema={purchaseSchema}
          defaultValues={editDefaults}
          submitting={updateMutation.loading}
          onSubmit={(values) => {
            if (editRow) void updateMutation.mutate({ id: editRow.id, values });
          }}
          onClose={editModal.closeModal}
        />
      ) : null}

      <DisbursementHistoryModal
        open={historyModal.modal.visible}
        row={historyRow}
        audit={audit}
        loading={auditLoading}
        userNameOf={userNameOf}
        onClose={historyModal.closeModal}
      />
    </>
  );
};

export default PurchasesTable;
