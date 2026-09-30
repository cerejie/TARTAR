import {
  FileCheck,
  FileText,
  History,
  Pencil,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import PeriodPrintModal from "../../common/modal/PeriodPrintModal";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import TruncateCell from "../../common/table/TruncateCell";
import DisbursementHistoryModal from "../../disbursement/modal/DisbursementHistoryModal";
import StatusTag from "../../common/status/StatusTag";
import UserCell from "../../user/table/cells/UserCell";
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
import { formatDate, formatDateTime, formatMoney } from "../../../utils/format.utils";
import { voucherBreakdownItems } from "../../../utils/voucher.utils";

const PurchasesTable = () => {
  const {
    permissions,
    rows,
    totalCount,
    pagination,
    goToPage,
    sortKey,
    sortOptions,
    changeSort,
    loading,
    refreshing,
    error,
    retry,
    branchName,
    userById,
    userNameOf,
    paymentLabelOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    historyRow,
    audit,
    auditLoading,
    sections,
    defaults,
    formSummary,
    deriveFormValues,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
    printModalKey,
    openPrint,
    printPeriod,
  } = usePurchaseListHook();

  const openConfirm = useConfirm();

  const payeeOf = (row: IDisbursement) =>
    row.voucher?.payee ?? row.supplier?.name ?? "—";

  const actionsOf = (row: IDisbursement): IRowAction[] => {
    const locked = isDisbursementLocked(row);

    return [
      ...(permissions.encodeTransactions
        ? [
            {
              key: "edit",
              label: "Edit purchase",
              hint: locked ? "Locked" : undefined,
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
      mobile: "subtitle",
      dataIndex: "txn_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    { title: "Payee", mobile: "title", key: "payee", render: (_, row) => payeeOf(row) },
    {
      title: "Branch",
      dataIndex: "branch",
      collapse: "xl",
      render: (value: string) => <TruncateCell text={branchName(value)} />,
    },
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
      collapse: "2xl",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Amount to pay",
      mobile: "amount",
      key: "amount_to_pay",
      align: "right",
      className: nowrapCell,
      render: (_, row) => formatMoney(row.voucher?.amount ?? row.amount),
    },
    {
      title: "Due date",
      dataIndex: "due_date",
      className: nowrapCell,
      render: (value: string | null, row) =>
        value && row.payable?.status !== "paid" ? formatDate(value) : "Paid",
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            key: "user",
            collapse: "2xl" as const,
            skeleton: "avatar" as const,
            render: (_: unknown, row: IDisbursement) => (
              <UserCell
                user={row.created_by ? userById.get(row.created_by) : undefined}
              />
            ),
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
          key: "branch",
          label: "Branch",
          render: (row) => branchName(row.branch),
        },
        {
          key: "amount",
          label: "Amount",
          render: (row) => formatMoney(row.amount),
        },
        ...(permissions.isManager
          ? [
              {
                key: "recorded_by",
                label: "Recorded by",
                render: (row: IDisbursement) => userNameOf(row.created_by),
              },
            ]
          : []),
        {
          key: "cash_account",
          label: "Paid from",
          render: (row) => paymentLabelOf(row),
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
        {
          key: "recorded_at",
          label: "Recorded at",
          render: (row) => formatDateTime(row.created_at),
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
        ...voucherBreakdownItems<IDisbursement>((row) => row.voucher),
      ],
    },
  ];

  return (
    <>
      <TablePanel
        toolbar={
          <FilterToolbar
            sort={
              <SortSelect
                value={sortKey}
                options={sortOptions}
                onChange={changeSort}
              />
            }
            actions={
              <RequirePermission can="encodeTransactions" fallback={null}>
                <AppButton onPress={() => formModal.openModal()}>
                  <Plus />
                  Record purchase
                </AppButton>
              </RequirePermission>
            }
          >
            <LedgerFilterBar showDateBasis layout="popover" />
            <AppButton variant="outline" onPress={openPrint}>
              <Printer />
              Print
            </AppButton>
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
          refreshing={refreshing}
          error={error}
          onRetry={retry}
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
        size="lg"
        sections={sections}
        summary={formSummary}
        deriveValues={deriveFormValues}
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
          size="lg"
          sections={sections}
          summary={formSummary}
          deriveValues={deriveFormValues}
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

      <PeriodPrintModal
        modalKey={printModalKey}
        title="Print purchases"
        onPrint={printPeriod}
      />
    </>
  );
};

export default PurchasesTable;
