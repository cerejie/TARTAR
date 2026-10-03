import { ArrowLeft, CircleCheck, FileText, Printer } from "lucide-react";
import type { IDetailSection } from "../../models/common/detail.model";
import { filteredEmptyHint } from "../../models/common/table.model";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  payableStatusColors,
  payableStatusLabels,
  payableStatusValues,
} from "../../enums/ledger.enum";
import { ledgerExpansionKey } from "../../keys/table.keys";
import { useIsCompact, useIsPhone } from "../../hook/common/breakpoint.hook";
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
import AppModal from "../common/modal/AppModal";
import StatusTag from "../common/status/StatusTag";
import DataTable from "../common/table/DataTable";
import RowActionMenu from "../common/table/RowActionMenu";
import PaymentsPanel from "../payment/PaymentsPanel";
import LedgerPartyHero from "./cards/LedgerPartyHero";
import LedgerPartyOverview from "./cards/LedgerPartyOverview";
import LedgerAmountCell from "./tables/cells/LedgerAmountCell";
import LedgerPartySheet from "./views/LedgerPartySheet";

const SupplierLedgerView = () => {
  const {
    supplier,
    detailOpen,
    partyTab,
    setPartyTab,
    permissions,
    rows,
    listLoading,
    summary,
    summaryLoading,
    lastPayment,
    lastPaymentLoading,
    payments,
    branchName,
    printScope,
    userNameOf,
    openMarkPaid,
    closeSupplierDetail,
  } = useSupplierDetailHook();
  const isCompact = useIsCompact();
  const isPhone = useIsPhone();

  if (!supplier) return null;

  const printLedgerStatement = () =>
    printStatement(
      "payable",
      supplier.partyName,
      summary,
      rows,
      payments,
      branchName,
      printScope
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

  const showCreatedBy =
    permissions.isManager &&
    rows.some((row) => !isEmptyDetailValue(userNameOf(row.created_by)));

  const statusColumn: IDataTableColumn<IPayable> = {
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
  };

  const phoneColumns: IDataTableColumn<IPayable>[] = [
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
      title: "Amount",
      key: "amount",
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

  const columns: IDataTableColumn<IPayable>[] = [
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
      mobile: "amount",
      dataIndex: "amount",
      align: "right",
      render: (_, row) => formatMoney(payableAmountDueOf(row)),
    },
    statusColumn,
    ...(showCreatedBy
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
          render: (row) => row.reference_number,
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

  const recordsList = (
    <>
      <FilterToolbar>
        <LedgerFilterBar
          scope="supplier-ledger"
          showStatus
          statusValues={payableStatusValues}
          layout="popover"
        />
      </FilterToolbar>

      <DataTable<IPayable>
        columns={isPhone ? phoneColumns : columns}
        data={rows}
        loading={listLoading}
        pageSize={5}
        expansionKey={ledgerExpansionKey("supplier-ledger")}
        detailSections={detailSections}
        detailTitle={() => "Payable"}
        detailActions={actionsOf}
        emptyText="No payables match the filters"
        emptyHint={filteredEmptyHint}
        rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
      />
    </>
  );

  const paymentsList = (
    <PaymentsPanel
      kind="payable"
      party={{
        partyId: supplier.partyId,
        partyName: supplier.partyName,
      }}
    />
  );

  if (isPhone) {
    return (
      <LedgerPartySheet
        open={detailOpen}
        title="Supplier ledger"
        hero={
          <LedgerPartyHero
            name={supplier.partyName}
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
        actions={[]}
        onClose={closeSupplierDetail}
      />
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
        unpaidLabel="Unpaid payables"
      />

      {isCompact ? <h3 className={ledgerSectionTitle}>Records</h3> : null}

      {recordsList}

      <h3 className={ledgerSectionTitle}>Payments</h3>
      {paymentsList}
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
