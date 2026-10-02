import {
  Calculator,
  Check,
  FileCheck,
  History,
  MessageSquareWarning,
  Pencil,
  Plus,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import PrimaryAction from "../../common/button/PrimaryAction";
import FilterToolbar from "../../common/filter/FilterToolbar";
import LedgerFilterBar from "../../common/filter/LedgerFilterBar";
import SortSelect from "../../common/filter/SortSelect";
import EntityFormModal from "../../common/form/EntityFormModal";
import RequirePermission from "../../common/guard/RequirePermission";
import StatusTag from "../../common/status/StatusTag";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import VoucherSourceModals from "../modal/VoucherSourceModals";
import { transactionTypeLabels } from "../../../enums/transaction.enum";
import {
  voucherStatusColors,
  voucherStatusLabels,
  voucherTypeLabels,
  type VoucherStatus,
} from "../../../enums/voucher.enum";
import { useVoucherListHook } from "../../../hook/data/voucher/voucher.list.hook";
import { voucherExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import {
  voucherRejectSchema,
  voucherSchema,
  type IVoucherInput,
  type IVoucherRejectInput,
} from "../../../models/data/voucher/voucher.request";
import {
  voucherDisbursementKind,
  voucherPurpose,
  type IVoucher,
} from "../../../models/data/voucher/voucher.response";
import {
  branchCell,
  cellHint,
  nowrapCell,
  stackedCell,
  tagRow,
} from "../../../styles/table/table.styles";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatTime,
} from "../../../utils/format.utils";
import { voucherBreakdownItems } from "../../../utils/voucher.utils";

const VouchersTable = () => {
  const {
    permissions,
    vouchers,
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
    userNameOf,
    formModal,
    sections,
    defaults,
    formSummary,
    deriveFormValues,
    createMutation,
    editModal,
    editRow,
    editDefaultsOf,
    updateMutation,
    confirmApprove,
    rejectModal,
    rejectRow,
    rejectSections,
    rejectDefaults,
    rejectMutation,
    print,
    sourceModal,
    reasonModal,
    isOwnOpen,
  } = useVoucherListHook();

  const sourceActionsOf = (voucher: IVoucher): IRowAction[] => {
    if (voucher.status === "rejected") {
      if (voucher.transaction_id && !permissions.encodeTransactions) return [];
      return [
        {
          key: "view-reason",
          label: voucher.transaction_id ? "Resubmit" : "View reason",
          icon: <MessageSquareWarning />,
          priority: "primary",
          onSelect: () =>
            voucher.transaction_id
              ? sourceModal.openModal(voucher)
              : reasonModal.openModal(voucher),
        },
      ];
    }

    if (!isOwnOpen(voucher)) return [];

    if (!voucher.transaction_id) {
      return [
        {
          key: "edit",
          label: "Edit voucher",
          icon: <Pencil />,
          priority: "secondary",
          onSelect: () => editModal.openModal(voucher),
        },
      ];
    }

    return [
      {
        key: "edit",
        label: `Edit ${transactionTypeLabels[
          voucherDisbursementKind(voucher)
        ].toLowerCase()}`,
        icon: <Pencil />,
        priority: "secondary",
        onSelect: () => sourceModal.openModal(voucher),
      },
    ];
  };

  const actionsOf = (voucher: IVoucher): IRowAction[] => {
    const isPending = voucher.status === "pending";
    const isApproved = voucher.status === "approved";

    return [
      ...sourceActionsOf(voucher),
      ...(permissions.approveVouchers && isPending
        ? [
            {
              key: "approve",
              label: "Approve voucher",
              icon: <Check />,
              priority: "primary" as const,
              onSelect: () => confirmApprove(voucher),
            },
            {
              key: "reject",
              label: "Reject voucher",
              icon: <X />,
              danger: true,
              onSelect: () => rejectModal.openModal(voucher),
            },
          ]
        : []),
      {
        key: "print",
        label: "Print voucher",
        hint: isApproved ? undefined : "Needs approval",
        icon: <Printer />,
        priority: isApproved ? "secondary" : undefined,
        disabled: !isApproved,
        onSelect: () => print(voucher),
      },
    ];
  };

  const columns: IDataTableColumn<IVoucher>[] = [
    {
      title: "Voucher no.",
      mobile: "subtitle",
      dataIndex: "voucher_no",
      className: nowrapCell,
      render: (value: string | null, voucher) => (
        <span className={stackedCell}>
          {value || "Pending sync"}
          <span className={cellHint}>{voucherTypeLabels[voucher.type]}</span>
        </span>
      ),
    },
    {
      title: "Payee",
      mobile: "title",
      dataIndex: "payee",
      render: (payee: string, voucher) => (
        <span className={stackedCell}>
          {payee}
          <span className={cellHint}>{voucherPurpose(voucher)}</span>
        </span>
      ),
    },
    {
      title: "Branch",
      mobile: "hidden",
      dataIndex: "branch",
      collapse: "xl",
      className: branchCell,
      render: branchName,
    },
    {
      title: "Amount",
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number, voucher) =>
        voucher.gross_amount !== null && voucher.gross_amount !== value ? (
          <span className={stackedCell}>
            {formatMoney(value)}
            <span className={cellHint}>
              Invoice {formatMoney(voucher.gross_amount)}
            </span>
          </span>
        ) : (
          formatMoney(value)
        ),
    },
    {
      title: "Created",
      mobile: "hidden",
      dataIndex: "created_at",
      collapse: "2xl",
      className: nowrapCell,
      render: (value: string) => (
        <span className={stackedCell}>
          {formatDate(value)}
          <span className={cellHint}>{formatTime(value)}</span>
        </span>
      ),
    },
    {
      title: "Status",
      mobile: "status",
      dataIndex: "status",
      render: (status: VoucherStatus, voucher) => (
        <span className={tagRow}>
          <StatusTag
            color={voucherStatusColors[status]}
            label={voucherStatusLabels[status]}
            hint={voucher.rejection_reason ?? undefined}
          />
          {voucher.printed ? <StatusTag label="Printed" /> : null}
        </span>
      ),
    },
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, voucher) => <RowActionMenu actions={actionsOf(voucher)} />,
    },
  ];

  const detailSections: IDetailSection<IVoucher>[] = [
    {
      key: "financial",
      title: "Financial summary",
      icon: <Calculator />,
      disclosure: "expanded",
      items: voucherBreakdownItems<IVoucher>((voucher) => voucher),
    },
    {
      key: "voucher",
      title: "Voucher details",
      icon: <FileCheck />,
      disclosure: "collapsed",
      items: [
        {
          key: "source",
          label: "Source",
          render: (voucher) => voucherPurpose(voucher),
        },
        {
          key: "payee",
          label: "Payee",
          render: (voucher) => voucher.payee,
        },
        {
          key: "voucher_no",
          label: "Reference",
          render: (voucher) => voucher.voucher_no || "Pending sync",
        },
        {
          key: "type",
          label: "Voucher type",
          render: (voucher) => voucherTypeLabels[voucher.type],
        },
        {
          key: "branch",
          label: "Branch",
          render: (voucher) => branchName(voucher.branch),
        },
        {
          key: "category",
          label: "Category",
          render: (voucher) => voucher.category,
        },
        {
          key: "due_date",
          label: "Payable due date",
          render: (voucher) =>
            voucher.due_date ? formatDate(voucher.due_date) : "—",
        },
        {
          key: "check_bank",
          hidden: (voucher) => voucher.type !== "check",
          label: "Bank issuing",
          render: (voucher) => voucher.check_bank || "—",
        },
        {
          key: "check_number",
          hidden: (voucher) => voucher.type !== "check",
          label: "Check number",
          render: (voucher) => voucher.check_number || "—",
        },
        {
          key: "check_due_date",
          hidden: (voucher) => voucher.type !== "check",
          label: "Check due date",
          render: (voucher) =>
            voucher.check_due_date ? formatDate(voucher.check_due_date) : "—",
        },
      ],
    },
    {
      key: "approval",
      title: "Approval",
      icon: <ShieldCheck />,
      disclosure: "collapsed",
      items: [
        {
          key: "status",
          label: "Status",
          render: (voucher) => voucherStatusLabels[voucher.status],
        },
        {
          key: "decided_by",
          label: "Decided by",
          hidden: (voucher) => !voucher.approved_by,
          render: (voucher) => userNameOf(voucher.approved_by),
        },
        {
          key: "approved_at",
          label: "Decided at",
          render: (voucher) =>
            voucher.approved_at ? formatDateTime(voucher.approved_at) : "—",
        },
        {
          key: "rejection_reason",
          label: "Rejection reason",
          hidden: (voucher) => !voucher.rejection_reason,
          render: (voucher) => voucher.rejection_reason,
        },
      ],
    },
    {
      key: "audit",
      title: "Audit history",
      icon: <History />,
      disclosure: "collapsed",
      items: [
        {
          key: "prepared_by",
          label: "Prepared by",
          render: (voucher) => userNameOf(voucher.created_by),
        },
        {
          key: "created_at",
          label: "Created",
          render: (voucher) => formatDateTime(voucher.created_at),
        },
        {
          key: "printed",
          label: "Printed",
          render: (voucher) => (voucher.printed ? "Yes" : "No"),
        },
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
              <RequirePermission can="createManualVouchers" fallback={null}>
                <PrimaryAction
                  icon={<Plus />}
                  label="Manual voucher"
                  onPress={() => formModal.openModal()}
                />
              </RequirePermission>
            }
          >
            <LedgerFilterBar
              scope="vouchers"
              layout="popover"
              showSearch
              showReference={false}
            />
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
        <DataTable<IVoucher>
          columns={columns}
          data={vouchers}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          pagination={pagination}
          detachedPagination
          totalCount={totalCount}
          onPageChange={goToPage}
          expansionKey={voucherExpansionKey}
          detailSections={detailSections}
          detailTitle={(voucher) => `${voucherTypeLabels[voucher.type]} voucher`}
          detailActions={actionsOf}
          emptyText="No vouchers match the current filters"
        />
      </TablePanel>

      <EntityFormModal<IVoucherInput>
        open={formModal.modal.visible}
        title="Manual voucher"
        sections={sections}
        summary={formSummary}
        deriveValues={deriveFormValues}
        schema={voucherSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Submit"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      {editRow ? (
        <EntityFormModal<IVoucherInput>
          open={editModal.modal.visible}
          title={`Edit voucher · ${editRow.voucher_no ?? editRow.payee}`}
          sections={sections}
          summary={formSummary}
          deriveValues={deriveFormValues}
          schema={voucherSchema}
          defaultValues={editDefaultsOf(editRow)}
          submitting={updateMutation.loading}
          submitText="Save changes"
          onSubmit={(values) =>
            void updateMutation.mutate({ id: editRow.id, values })
          }
          onClose={editModal.closeModal}
        />
      ) : null}

      {rejectRow ? (
        <EntityFormModal<IVoucherRejectInput>
          open={rejectModal.modal.visible}
          title={`Reject voucher · ${rejectRow.payee} · ${formatMoney(rejectRow.amount)}`}
          sections={rejectSections}
          schema={voucherRejectSchema}
          defaultValues={rejectDefaults}
          submitting={rejectMutation.loading}
          submitText="Reject"
          submitKind="delete"
          onSubmit={(values) =>
            void rejectMutation.mutate({ id: rejectRow.id, values })
          }
          onClose={rejectModal.closeModal}
        />
      ) : null}

      <VoucherSourceModals />
    </>
  );
};

export default VouchersTable;
