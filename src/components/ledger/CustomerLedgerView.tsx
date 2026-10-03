import {
  ArrowLeft,
  CircleDollarSign,
  FileText,
  Info,
  Printer,
  X,
} from "lucide-react";
import type { IRowAction } from "../../models/common/action.model";
import type { IDetailSection } from "../../models/common/detail.model";
import { filteredEmptyHint } from "../../models/common/table.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import { customerDetailsModalKey } from "../../keys/modal.keys";
import { ledgerExpansionKey } from "../../keys/table.keys";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
} from "../../enums/ledger.enum";
import StatusTag from "../common/status/StatusTag";
import { useIsCompact, useIsPhone } from "../../hook/common/breakpoint.hook";
import { useModalActions } from "../../hook/common/modal.hook";
import { useCustomerDetailHook } from "../../hook/data/ledger/customer.detail.hook";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import {
  ledgerHead,
  ledgerHeadActions,
  ledgerHeadStart,
  ledgerIconButton,
  ledgerIconLabel,
  ledgerPane,
  ledgerSectionTitle,
  ledgerTitle,
} from "../../styles/ledger/ledger.styles";
import {
  dataTableRowOverdue,
  nowrapCell,
} from "../../styles/table/table.styles";
import { isEmptyDetailValue } from "../../utils/detail.utils";
import { formatDate, formatMoney } from "../../utils/format.utils";
import {
  ledgerRecordSubtitleOf,
  ledgerRecordTitleOf,
} from "../../utils/ledger.utils";
import { printStatement } from "../../utils/print.utils";
import SheetActions from "../common/app/SheetActions";
import AppButton from "../common/button/AppButton";
import FilterToolbar from "../common/filter/FilterToolbar";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import RequirePermission from "../common/guard/RequirePermission";
import AppModal from "../common/modal/AppModal";
import DataTable from "../common/table/DataTable";
import PaymentsPanel from "../payment/PaymentsPanel";
import LedgerPartyHero from "./cards/LedgerPartyHero";
import LedgerPartyOverview from "./cards/LedgerPartyOverview";
import CustomerInfoModal from "./CustomerInfoModal";
import PaymentAllocationModal from "./PaymentAllocationModal";
import LedgerAmountCell from "./tables/cells/LedgerAmountCell";
import LedgerPartySheet from "./views/LedgerPartySheet";

const CustomerLedgerView = () => {
  const {
    customer,
    detailOpen,
    permissions,
    rows,
    selection,
    selectedRows,
    setSelection,
    selecting,
    setSelecting,
    partyTab,
    setPartyTab,
    hasUnpaidRows,
    summary,
    summaryLoading,
    listLoading,
    lastPayment,
    lastPaymentLoading,
    payments,
    branchName,
    printScope,
    userNameOf,
    paymentModal,
    infoModal,
    recordPaymentMutation,
    closeLedgerDetail,
  } = useCustomerDetailHook();

  const { openModal } = useModalActions();
  const isCompact = useIsCompact();
  const isPhone = useIsPhone();

  if (!customer) return null;

  const printLedgerStatement = () =>
    printStatement(
      "receivable",
      customer.customerName,
      summary,
      rows,
      payments,
      branchName,
      printScope
    );

  const payReceivable = (row: IReceivable) => {
    setSelection([row.id]);
    paymentModal.openModal();
  };

  const rowActionsOf = (row: IReceivable): IRowAction[] =>
    permissions.encodeTransactions
      ? [
          {
            key: "payment",
            label:
              row.status === "paid"
                ? "Record payment — already paid"
                : "Record payment",
            icon: <CircleDollarSign />,
            priority: "primary",
            disabled: row.status === "paid",
            onSelect: () => payReceivable(row),
          },
        ]
      : [];

  const ledgerActions: IRowAction[] = [
    ...(permissions.encodeTransactions
      ? [
          {
            key: "payment",
            label:
              selectedRows.length === 0
                ? "Select receivables to pay"
                : "Record payment",
            icon: <CircleDollarSign />,
            priority: "primary" as const,
            disabled: selectedRows.length === 0,
            onSelect: () => paymentModal.openModal(),
          },
        ]
      : []),
    {
      key: "print",
      label: "Print statement",
      icon: <Printer />,
      priority: "secondary" as const,
      onSelect: printLedgerStatement,
    },
    {
      key: "info",
      label: "Customer information",
      icon: <Info />,
      onSelect: () => infoModal.openModal(),
    },
  ];

  const phoneActions: IRowAction[] = selecting
    ? [
        {
          key: "pay-selected",
          label:
            selectedRows.length === 0
              ? "Select receivables to pay"
              : `Pay ${selectedRows.length} selected`,
          icon: <CircleDollarSign />,
          priority: "primary",
          disabled: selectedRows.length === 0,
          onSelect: () => paymentModal.openModal(),
        },
        {
          key: "cancel-selection",
          label: "Cancel",
          icon: <X />,
          priority: "secondary",
          onSelect: () => setSelecting(false),
        },
      ]
    : [
        ...(permissions.encodeTransactions
          ? [
              {
                key: "payment",
                label: "Record payment",
                icon: <CircleDollarSign />,
                priority: "primary" as const,
                disabled: !hasUnpaidRows,
                onSelect: () => setSelecting(true),
              },
            ]
          : []),
        {
          key: "info",
          label: "Customer information",
          icon: <Info />,
          onSelect: () => infoModal.openModal(),
        },
      ];

  const showCreatedBy =
    permissions.isManager &&
    rows.some((row) => !isEmptyDetailValue(userNameOf(row.created_by)));

  const statusColumn: IDataTableColumn<IReceivable> = {
    title: "Status",
    mobile: "status",
    dataIndex: "status",
    render: (status: IReceivable["status"], row) =>
      isLedgerOverdue(row) ? (
        <StatusTag color="negative" label="Overdue" />
      ) : (
        <StatusTag color={ledgerStatusColors[status]} label={ledgerStatusLabels[status]} />
      ),
  };

  const phoneColumns: IDataTableColumn<IReceivable>[] = [
    {
      title: "Record",
      key: "record",
      render: (_, row) => ledgerRecordTitleOf(row),
    },
    {
      title: "Due date",
      key: "due",
      mobile: "subtitle",
      render: (_, row) => ledgerRecordSubtitleOf(row),
    },
    {
      title: "Balance",
      key: "balance",
      mobile: "amount",
      align: "right",
      render: (_, row) => (
        <LedgerAmountCell
          amount={row.amount}
          paidAmount={row.paid_amount}
          paid={row.status === "paid"}
        />
      ),
    },
    statusColumn,
  ];

  const columns: IDataTableColumn<IReceivable>[] = [
    {
      title: "Date",
      dataIndex: "created_at",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Due date",
      dataIndex: "due_date",
      className: nowrapCell,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Branch",
      mobile: "hidden",
      dataIndex: "branch",
      render: branchName,
    },
    {
      title: "Reference",
      mobile: "subtitle",
      dataIndex: "reference_number",
      className: nowrapCell,
      render: (value: string | null) => value || "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Paid",
      mobile: "hidden",
      dataIndex: "paid_amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Balance",
      mobile: "amount",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    statusColumn,
    ...(showCreatedBy
      ? [
          {
            title: "Created by",
            key: "created_by",
            mobile: "hidden" as const,
            render: (_: unknown, row: IReceivable) =>
              userNameOf(row.created_by),
          },
        ]
      : []),
  ];

  const detailSections: IDetailSection<IReceivable>[] = [
    {
      key: "record",
      title: "Record",
      icon: <FileText />,
      items: [
        {
          key: "due_date",
          label: "Due date",
          render: (row) => formatDate(row.due_date),
        },
        {
          key: "reference",
          label: "Reference",
          render: (row) => row.reference_number,
        },
        {
          key: "branch",
          label: "Branch",
          render: (row) => branchName(row.branch),
        },
        {
          key: "paid",
          label: "Paid",
          render: (row) =>
            `${formatMoney(row.paid_amount)} of ${formatMoney(row.amount)}`,
        },
      ...(permissions.isManager
        ? [
            {
              key: "recorded_by",
              label: "Recorded by",
              render: (row: IReceivable) => userNameOf(row.created_by),
            },
          ]
        : []),
      ],
    },
  ];

  const ledgerHeader = (
    <div className={ledgerHead}>
      <div className={ledgerHeadStart}>
        <AppButton
          variant="outline"
          className={ledgerIconButton}
          onPress={closeLedgerDetail}
        >
          <ArrowLeft />
          <span className={ledgerIconLabel}>Back to customers</span>
        </AppButton>
        <h2 className={ledgerTitle}>{customer.customerName}</h2>
      </div>
      <div className={ledgerHeadActions}>
        <AppButton
          variant="outline"
          size="icon"
          aria-label={`Information for ${customer.customerName}`}
          tooltip="Customer information"
          onPress={() => infoModal.openModal()}
        >
          <Info />
        </AppButton>
        <AppButton
          variant="outline"
          className={ledgerIconButton}
          onPress={printLedgerStatement}
        >
          <Printer />
          <span className={ledgerIconLabel}>Print statement</span>
        </AppButton>
        <RequirePermission can="encodeTransactions" fallback={null}>
          <AppButton
            variant={selectedRows.length === 0 ? "outline" : "default"}
            disabled={selectedRows.length === 0}
            onPress={() => paymentModal.openModal()}
          >
            <CircleDollarSign />
            {selectedRows.length === 0
              ? "Select receivables to pay"
              : "Record payment"}
          </AppButton>
        </RequirePermission>
      </div>
    </div>
  );

  const recordsList = (
    <>
      <FilterToolbar>
        <LedgerFilterBar
          scope="customer-ledger"
          showStatus
          showOverdue
          layout="popover"
        />
      </FilterToolbar>

      <DataTable<IReceivable>
        columns={isPhone ? phoneColumns : columns}
        data={rows}
        loading={listLoading}
        pageSize={5}
        expansionKey={ledgerExpansionKey("customer-ledger")}
        detailSections={detailSections}
        detailTitle={() => "Receivable"}
        detailActions={rowActionsOf}
        emptyText="No receivables match the filters"
        emptyHint={filteredEmptyHint}
        rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
        rowSelection={
          isPhone && !selecting
            ? undefined
            : {
                selectedRowKeys: selection,
                onChange: (keys) => setSelection(keys as string[]),
                getCheckboxProps: (row) => ({ disabled: row.status === "paid" }),
              }
        }
      />
    </>
  );

  const paymentsList = (
    <PaymentsPanel
      kind="receivable"
      party={{
        partyId: customer.customerId,
        partyName: customer.customerName,
      }}
    />
  );

  const modals = (
    <>
      <CustomerInfoModal
        open={infoModal.modal.visible}
        customer={customer}
        onClose={infoModal.closeModal}
        onEdit={
          permissions.encodeTransactions
            ? () => {
                infoModal.closeModal();
                openModal(customerDetailsModalKey, customer);
              }
            : undefined
        }
      />

      <PaymentAllocationModal
        open={paymentModal.modal.visible}
        customer={customer}
        rows={selectedRows}
        submitting={recordPaymentMutation.loading}
        onSubmit={(values) => void recordPaymentMutation.mutate(values)}
        onClose={paymentModal.closeModal}
      />
    </>
  );

  if (isPhone) {
    return (
      <>
        <LedgerPartySheet
          open={detailOpen}
          title="Customer ledger"
          hero={
            <LedgerPartyHero
              name={customer.customerName}
              summary={summary}
              summaryLoading={summaryLoading}
              lastPayment={lastPayment}
              unpaidNoun="unpaid"
            />
          }
          tab={partyTab}
          onTabChange={setPartyTab}
          records={recordsList}
          payments={paymentsList}
          actions={phoneActions}
          onClose={closeLedgerDetail}
        />
        {modals}
      </>
    );
  }

  const content = (
    <>
      {isCompact ? null : ledgerHeader}

      <LedgerPartyOverview
        summary={summary}
        summaryLoading={summaryLoading}
        lastPayment={lastPayment}
        lastPaymentLoading={lastPaymentLoading}
        unpaidLabel="Unpaid transactions"
      />

      {isCompact ? <h3 className={ledgerSectionTitle}>Records</h3> : null}

      {recordsList}

      <h3 className={ledgerSectionTitle}>Payments</h3>
      {paymentsList}

      {modals}
    </>
  );

  if (!isCompact) return content;

  return (
    <AppModal
      open={detailOpen}
      title={customer.customerName}
      kind="flow"
      footer={<SheetActions actions={ledgerActions} />}
      onClose={closeLedgerDetail}
    >
      <div className={ledgerPane}>{content}</div>
    </AppModal>
  );
};

export default CustomerLedgerView;
