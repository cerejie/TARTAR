import { Check, FileCheck, Landmark, Plus, Printer, X } from "lucide-react";
import type { IDataTableColumn } from "../../../models/common/table.model";
import AppButton from "../../common/button/AppButton";
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
  voucherSchema,
  type IVoucherInput,
} from "../../../models/data/voucher/voucher.request";
import {
  voucherPurpose,
  type IVoucher,
} from "../../../models/data/voucher/voucher.response";
import {
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
    formModal,
    fields,
    defaults,
    createMutation,
    confirmDecision,
    print,
  } = useVoucherListHook();

  const actionsOf = (voucher: IVoucher): IRowAction[] => {
    const isPending = voucher.status === "pending";
    const isApproved = voucher.status === "approved";

    return [
      ...(permissions.approveVouchers && isPending
        ? [
            {
              key: "approve",
              label: "Approve voucher",
              icon: <Check />,
              onSelect: () => confirmDecision(voucher, true),
            },
            {
              key: "reject",
              label: "Reject voucher",
              icon: <X />,
              danger: true,
              onSelect: () => confirmDecision(voucher, false),
            },
          ]
        : []),
      {
        key: "print",
        label: "Print voucher",
        hint: isApproved ? undefined : "Needs approval",
        icon: <Printer />,
        disabled: !isApproved,
        onSelect: () => print(voucher),
      },
    ];
  };

  const columns: IDataTableColumn<IVoucher>[] = [
    {
      title: "Voucher no.",
      dataIndex: "voucher_no",
      className: nowrapCell,
      render: (value: string | null) => value || "Pending sync",
    },
    { title: "Payee", dataIndex: "payee" },
    {
      title: "Purpose",
      key: "purpose",
      render: (_, voucher) => voucherPurpose(voucher),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type: IVoucher["type"]) => voucherTypeLabels[type],
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      className: nowrapCell,
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Created",
      dataIndex: "created_at",
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
      dataIndex: "status",
      className: nowrapCell,
      render: (status: VoucherStatus, voucher) => (
        <span className={tagRow}>
          <StatusTag
            color={voucherStatusColors[status]}
            label={voucherStatusLabels[status]}
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
      key: "voucher",
      title: "Voucher",
      icon: <FileCheck />,
      items: [
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
          key: "approved_at",
          label: "Decided at",
          render: (voucher) =>
            voucher.approved_at ? formatDateTime(voucher.approved_at) : "—",
        },
      ],
    },
    {
      key: "check",
      title: "Check",
      icon: <Landmark />,
      items: [
        {
          key: "check_bank",
          label: "Bank issuing",
          render: (voucher) => voucher.check_bank || "—",
        },
        {
          key: "check_number",
          label: "Check number",
          render: (voucher) => voucher.check_number || "—",
        },
        {
          key: "check_due_date",
          label: "Check due date",
          render: (voucher) =>
            voucher.check_due_date ? formatDate(voucher.check_due_date) : "—",
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
                <AppButton onPress={() => formModal.openModal()}>
                  <Plus />
                  Manual voucher
                </AppButton>
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
          expansionKey={voucherExpansionKey}
          detailSections={detailSections}
          emptyText="No vouchers match the current filters"
        />
      </TablePanel>

      <EntityFormModal<IVoucherInput>
        open={formModal.modal.visible}
        title="Manual voucher"
        fields={fields}
        schema={voucherSchema}
        defaultValues={defaults}
        submitting={createMutation.loading}
        submitText="Submit"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />
    </>
  );
};

export default VouchersTable;
