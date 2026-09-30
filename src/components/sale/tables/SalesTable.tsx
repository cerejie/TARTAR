import {
  Ban,
  BadgeCheck,
  FileText,
  History,
  Landmark,
  MessageSquareWarning,
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
import RequirePermission from "../../common/guard/RequirePermission";
import PeriodPrintModal from "../../common/modal/PeriodPrintModal";
import StatusTag from "../../common/status/StatusTag";
import DataTable from "../../common/table/DataTable";
import RowActionMenu from "../../common/table/RowActionMenu";
import TablePagination from "../../common/table/TablePagination";
import TablePanel from "../../common/table/TablePanel";
import DisbursementHistoryModal from "../../disbursement/modal/DisbursementHistoryModal";
import UserCell from "../../user/table/cells/UserCell";
import SaleFormModals from "../modal/SaleFormModals";
import { saleStatusColors, saleStatusLabels } from "../../../enums/sale.enum";
import { useSaleListHook } from "../../../hook/data/sale/sale.list.hook";
import { saleExpansionKey } from "../../../keys/table.keys";
import type { IRowAction } from "../../../models/common/action.model";
import type { IDetailSection } from "../../../models/common/detail.model";
import type { ISale } from "../../../models/data/sale/sale.response";
import { nowrapCell } from "../../../styles/table/table.styles";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/format.utils";

const SalesTable = () => {
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
    incomeSourceLabelOf,
    formModal,
    editModal,
    historyModal,
    depositModal,
    rejectModal,
    resubmitModal,
    historyRow,
    audit,
    auditLoading,
    verifySale,
    deleteSale,
    printModalKey,
    openPrint,
    printPeriod,
  } = useSaleListHook();

  const reviewerOf = (row: ISale) =>
    row.verified_by
      ? `${userNameOf(row.verified_by)} · ${formatDateTime(row.verified_at)}`
      : "—";

  const actionsOf = (row: ISale): IRowAction[] => {
    const undeposited = row.sale_status === "undeposited";
    const deposited = row.sale_status === "deposited";
    const rejected = row.sale_status === "rejected";

    return [
      ...(permissions.encodeTransactions && rejected
        ? [
            {
              key: "view-reason",
              label: "View reason",
              icon: <MessageSquareWarning />,
              onSelect: () => resubmitModal.openModal(row),
            },
          ]
        : []),
      ...(permissions.encodeTransactions && undeposited
        ? [
            {
              key: "deposit",
              label: "Mark deposited",
              icon: <Landmark />,
              onSelect: () => depositModal.openModal(row),
            },
            {
              key: "edit",
              label: "Edit sale",
              icon: <Pencil />,
              onSelect: () => editModal.openModal(row),
            },
          ]
        : []),
      ...(permissions.isManager && deposited
        ? [
            {
              key: "verify",
              label: "Verify",
              icon: <BadgeCheck />,
              onSelect: () => verifySale(row),
            },
            {
              key: "reject",
              label: "Reject",
              icon: <Ban />,
              danger: true,
              onSelect: () => rejectModal.openModal(row),
            },
          ]
        : []),
      {
        key: "history",
        label: "Edit history",
        icon: <History />,
        onSelect: () => historyModal.openModal(row),
      },
      ...(permissions.isManager && row.sale_status !== "verified"
        ? [
            {
              key: "delete",
              label: "Delete sale",
              icon: <Trash2 />,
              danger: true,
              onSelect: () => deleteSale(row),
            },
          ]
        : []),
    ];
  };

  const columns: IDataTableColumn<ISale>[] = [
    {
      title: "Date",
      mobile: "subtitle",
      dataIndex: "txn_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Customer",
      mobile: "title",
      key: "customer",
      render: (_, row) => row.customer?.name ?? "Walk-in",
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Status",
      mobile: "status",
      dataIndex: "sale_status",
      className: nowrapCell,
      render: (_, row) => (
        <StatusTag
          color={saleStatusColors[row.sale_status]}
          label={saleStatusLabels[row.sale_status]}
          hint={row.rejection_reason ?? undefined}
        />
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
    {
      title: "Deposit date",
      dataIndex: "deposit_date",
      className: nowrapCell,
      render: (value: string | null) => formatDate(value),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Recorded by",
            key: "user",
            skeleton: "avatar" as const,
            render: (_: unknown, row: ISale) => (
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
      render: (_: unknown, row: ISale) => (
        <RowActionMenu actions={actionsOf(row)} />
      ),
    },
  ];

  const detailSections: IDetailSection<ISale>[] = [
    {
      key: "sale",
      title: "Sale",
      icon: <FileText />,
      items: [
        {
          key: "reference",
          label: "Reference",
          render: (row) => row.reference_number || "—",
        },
        {
          key: "income_source",
          label: "Income source",
          render: (row) => incomeSourceLabelOf(row.income_source),
        },
        {
          key: "cash_account",
          label: "Cash account",
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
      key: "deposit",
      title: "Deposit",
      icon: <Landmark />,
      items: [
        {
          key: "deposited_by",
          label: "Deposited by",
          render: (row) =>
            row.deposited_by
              ? `${userNameOf(row.deposited_by)} · ${formatDateTime(row.deposited_at)}`
              : "—",
        },
        {
          key: "reviewed_by",
          label: "Reviewed by",
          render: reviewerOf,
        },
        {
          key: "rejection_reason",
          label: "Rejection reason",
          render: (row) => row.rejection_reason || "—",
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
              <RequirePermission can="encodeTransactions" fallback={null}>
                <AppButton onPress={() => formModal.openModal()}>
                  <Plus />
                  Record sale
                </AppButton>
              </RequirePermission>
            }
          >
            <LedgerFilterBar layout="popover" />
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
        <DataTable<ISale>
          columns={columns}
          data={rows}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={retry}
          pagination={pagination}
          detachedPagination
          expansionKey={saleExpansionKey}
          detailSections={detailSections}
          emptyText="No sales match the current filters"
        />
      </TablePanel>

      <SaleFormModals />

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
        title="Print sales"
        onPrint={printPeriod}
      />
    </>
  );
};

export default SalesTable;
