import {
  FileCheck,
  FileText,
  History,
  MessageSquareWarning,
  ReceiptText,
  Pencil,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { filteredEmptyHint } from "../../../models/common/table.model";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
import PrimaryAction from "../../common/button/PrimaryAction";
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
import DisbursementEditModal from "../../disbursement/modal/DisbursementEditModal";
import DisbursementHistoryModal from "../../disbursement/modal/DisbursementHistoryModal";
import StatusTag from "../../common/status/StatusTag";
import UserCell from "../../user/table/cells/UserCell";
import {
  voucherStatusColors,
  voucherStatusLabels,
  voucherTypeLabels,
} from "../../../enums/voucher.enum";
import { useIsPhone } from "../../../hook/common/breakpoint.hook";
import { useConfirm } from "../../../hook/common/confirmation.hook";
import { useExpenseListHook } from "../../../hook/data/expense/expense.list.hook";
import { expenseListKey } from "../../../keys/query.keys";
import { disbursementExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  expenseSchema,
  type IDisbursementInput,
} from "../../../models/data/transaction/transaction.request";
import {
  disbursementLinkedIds,
  type IDisbursement,
} from "../../../models/data/transaction/transaction.response";
import { nowrapCell, tagRow } from "../../../styles/table/table.styles";
import {
  isDisbursementLocked,
  isDisbursementRejected,
} from "../../../utils/disbursement.utils";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/format.utils";
import { voucherBreakdownItems } from "../../../utils/voucher.utils";

const ExpensesTable = () => {
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
    expenseCategoryLabelOf,
    userById,
    userNameOf,
    paymentLabelOf,
    formModal,
    editModal,
    historyModal,
    editRow,
    editLockedOf,
    historyRow,
    audit,
    auditLoading,
    sections,
    defaults,
    formSummary,
    deriveFormValues,
    createMutation,
    removeMutation,
    printModalKey,
    openPrint,
    printPeriod,
    openVoucher,
  } = useExpenseListHook();
  const isPhone = useIsPhone();

  const openConfirm = useConfirm();

  const payeeOf = (row: IDisbursement) =>
    row.voucher?.payee ?? row.supplier?.name ?? "—";

  const actionsOf = (row: IDisbursement): IRowAction[] => {
    const locked = isDisbursementLocked(row);
    const rejected = isDisbursementRejected(row);
    const editLocked = editLockedOf(row);
    const voucher = row.voucher;

    return [
      ...(permissions.encodeTransactions && rejected
        ? [
            {
              key: "resubmit",
              label: "Resubmit",
              icon: <MessageSquareWarning />,
              priority: "primary" as const,
              onSelect: () => editModal.openModal(row),
            },
          ]
        : []),
      ...(permissions.encodeTransactions && !rejected
        ? [
            {
              key: "edit",
              label: "Edit expense",
              hint: editLocked ? "Locked" : undefined,
              icon: <Pencil />,
              priority: "secondary" as const,
              disabled: editLocked,
              onSelect: () => editModal.openModal(row),
            },
          ]
        : []),
      ...(permissions.createVouchers && voucher
        ? [
            {
              key: "open-voucher",
              label: "Open voucher",
              icon: <ReceiptText />,
              priority: "secondary" as const,
              onSelect: () => openVoucher(voucher),
            },
          ]
        : []),
      {
        key: "history",
        label: "Edit history",
        icon: <History />,
        onSelect: () => historyModal.openModal(row),
      },
      ...(permissions.isManager && !locked && !rejected
        ? [
            {
              key: "delete",
              label: "Delete expense",
              icon: <Trash2 />,
              danger: true,
              onSelect: () =>
                openConfirm({
                  kind: "delete",
                  title: "Delete expense?",
                  message: `Deleting this expense of ${formatMoney(
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
      mobile: "hidden",
      dataIndex: "branch",
      collapse: "xl",
      render: branchName,
    },
    {
      title: "Expense type",
      mobile: "status",
      dataIndex: "expense_type",
      render: (value: IDisbursement["expense_type"]) =>
        expenseCategoryLabelOf(value),
    },
    {
      title: "Voucher",
      mobile: "status",
      key: "voucher_status",
      className: nowrapCell,
      render: (_, row) =>
        row.voucher ? (
          <span className={tagRow}>
            <StatusTag
              color={voucherStatusColors[row.voucher.status]}
              label={voucherStatusLabels[row.voucher.status]}
              hint={row.voucher.rejection_reason ?? undefined}
            />
            {row.voucher.printed ? <StatusTag label="Printed" /> : null}
          </span>
        ) : (
          <StatusTag label="Syncing" />
        ),
    },
    {
      title: "Amount",
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            mobile: "hidden" as const,
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
      key: "expense",
      title: "Expense",
      icon: <FileText />,
      items: [
        {
          key: "branch",
          label: "Branch",
          render: (row) => branchName(row.branch),
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
      title: "Voucher created automatically",
      icon: <FileCheck />,
      items: [
        {
          key: "voucher_status",
          label: "Voucher status",
          render: (row) =>
            row.voucher ? voucherStatusLabels[row.voucher.status] : "—",
        },
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
                <PrimaryAction
                  icon={<Plus />}
                  label="Record expense"
                  onPress={() => formModal.openModal()}
                />
              </RequirePermission>
            }
          >
            <LedgerFilterBar layout="popover" />
            {isPhone ? null : (
              <AppButton variant="outline" onPress={openPrint}>
                <Printer />
                Print
              </AppButton>
            )}
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
          totalCount={totalCount}
          onPageChange={goToPage}
          expansionKey={disbursementExpansionKey(expenseListKey)}
          pendingKeysOf={disbursementLinkedIds}
          detailSections={detailSections}
          detailTitle={() => "Expense"}
          detailActions={actionsOf}
          emptyText="No expenses match the current filters"
          emptyHint={filteredEmptyHint}
        />
      </TablePanel>

      <EntityFormModal<IDisbursementInput>
        open={formModal.modal.visible}
        title="Record expense"
        size="lg"
        sections={sections}
        summary={formSummary}
        deriveValues={deriveFormValues}
        schema={expenseSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      <DisbursementEditModal
        kind="expense"
        row={editRow}
        open={editModal.modal.visible}
        onClose={editModal.closeModal}
      />

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
        title="Print expenses"
        onPrint={printPeriod}
      />
    </>
  );
};

export default ExpensesTable;
