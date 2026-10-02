import { ArrowLeft, CircleCheck, FileText, Printer } from "lucide-react";
import type { IDetailSection } from "../../models/common/detail.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  payableStatusColors,
  payableStatusLabels,
  payableStatusValues,
} from "../../enums/ledger.enum";
import { ledgerExpansionKey } from "../../keys/table.keys";
import { useIsCompact } from "../../hook/common/breakpoint.hook";
import { useSupplierDetailHook } from "../../hook/data/ledger/supplier.detail.hook";
import type { IRowAction } from "../../models/common/action.model";
import {
  isLedgerOverdue,
  payableAmountDueOf,
  payableStatusOf,
  type IPayable,
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
import { formatDate, formatMoney } from "../../utils/format.utils";
import { printStatement } from "../../utils/print.utils";
import SheetActions from "../common/app/SheetActions";
import AppButton from "../common/button/AppButton";
import FilterToolbar from "../common/filter/FilterToolbar";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import AppModal from "../common/modal/AppModal";
import StatusTag from "../common/status/StatusTag";
import DataTable from "../common/table/DataTable";
import RowActionMenu from "../common/table/RowActionMenu";
import PaymentsPanel from "../payment/PaymentsPanel";
import LedgerPartyOverview from "./cards/LedgerPartyOverview";

const SupplierLedgerView = () => {
  const {
    supplier,
    detailOpen,
    permissions,
    rows,
    listLoading,
    summary,
    summaryLoading,
    lastPayment,
    lastPaymentLoading,
    payments,
    branchName,
    userNameOf,
    openMarkPaid,
    closeSupplierDetail,
  } = useSupplierDetailHook();
  const isCompact = useIsCompact();

  if (!supplier) return null;

  const printLedgerStatement = () =>
    printStatement(
      "payable",
      supplier.partyName,
      summary,
      rows,
      payments,
      branchName
    );

  const ledgerActions: IRowAction[] = [
    {
      key: "print",
      label: "Print statement",
      icon: <Printer />,
      priority: "secondary",
      onSelect: printLedgerStatement,
    },
  ];

  const actionsOf = (row: IPayable): IRowAction[] =>
    permissions.encodeTransactions
      ? [
          {
            key: "mark-paid",
            label: row.status === "paid" ? "Already paid" : "Mark paid",
            icon: <CircleCheck />,
            priority: "primary",
            disabled: row.status === "paid",
            onSelect: () => openMarkPaid(row),
          },
        ]
      : [];

  const columns: IDataTableColumn<IPayable>[] = [
    {
      title: "Date",
      dataIndex: "created_at",
      width: 120,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Due date",
      dataIndex: "due_date",
      width: 120,
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
      render: (value: string | null) => value || "—",
    },
    {
      title: "Amount",
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      render: (_, row) => formatMoney(payableAmountDueOf(row)),
    },
    {
      title: "Status",
      mobile: "status",
      key: "status",
      render: (_, row) => {
        const status = payableStatusOf(row);
        return (
          <StatusTag
            color={payableStatusColors[status]}
            label={payableStatusLabels[status]}
          />
        );
      },
    },
    ...(permissions.isManager
      ? [
          {
            title: "Created by",
            key: "created_by",
            mobile: "hidden" as const,
            render: (_: unknown, row: IPayable) => userNameOf(row.created_by),
          },
        ]
      : []),
    {
      title: "Action",
      key: "actions",
      align: "center",
      className: nowrapCell,
      render: (_, row) => <RowActionMenu actions={actionsOf(row)} />,
    },
  ];

  const detailSections: IDetailSection<IPayable>[] = [
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
          render: (row) => row.reference_number || "—",
        },
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
              render: (row: IPayable) => userNameOf(row.created_by),
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
          onPress={closeSupplierDetail}
        >
          <ArrowLeft />
          <span className={ledgerIconLabel}>Back to suppliers</span>
        </AppButton>
        <h2 className={ledgerTitle}>{supplier.partyName}</h2>
      </div>
      <div className={ledgerHeadActions}>
        <AppButton
          variant="outline"
          className={ledgerIconButton}
          onPress={printLedgerStatement}
        >
          <Printer />
          <span className={ledgerIconLabel}>Print statement</span>
        </AppButton>
      </div>
    </div>
  );

  const content = (
    <>
      {isCompact ? null : ledgerHeader}

      <LedgerPartyOverview
        summary={summary}
        summaryLoading={summaryLoading}
        lastPayment={lastPayment}
        lastPaymentLoading={lastPaymentLoading}
        unpaidLabel="Unpaid payables"
      />

      {isCompact ? <h3 className={ledgerSectionTitle}>Records</h3> : null}

      <FilterToolbar>
        <LedgerFilterBar
          scope="supplier-ledger"
          showStatus
          statusValues={payableStatusValues}
          layout="popover"
        />
      </FilterToolbar>

      <DataTable<IPayable>
        columns={columns}
        data={rows}
        loading={listLoading}
        pageSize={5}
        expansionKey={ledgerExpansionKey("supplier-ledger")}
        detailSections={detailSections}
        detailTitle={() => "Payable"}
        detailActions={actionsOf}
        emptyText="No payables match the filters"
        rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
      />

      <h3 className={ledgerSectionTitle}>Payments</h3>
      <PaymentsPanel
        kind="payable"
        party={{
          partyId: supplier.partyId,
          partyName: supplier.partyName,
        }}
      />
    </>
  );

  if (!isCompact) return content;

  return (
    <AppModal
      open={detailOpen}
      title={supplier.partyName}
      kind="flow"
      footer={<SheetActions actions={ledgerActions} />}
      onClose={closeSupplierDetail}
    >
      <div className={ledgerPane}>{content}</div>
    </AppModal>
  );
};

export default SupplierLedgerView;
