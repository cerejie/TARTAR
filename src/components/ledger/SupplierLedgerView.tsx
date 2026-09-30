import { ArrowLeft, CircleCheck, Printer } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  payableStatusColors,
  payableStatusLabels,
  payableStatusValues,
} from "../../enums/ledger.enum";
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
  ledgerSectionTitle,
  ledgerTitle,
} from "../../styles/ledger/ledger.styles";
import {
  dataTableRowOverdue,
  nowrapCell,
} from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { printStatement } from "../../utils/print.utils";
import AppButton from "../common/button/AppButton";
import StatCard from "../common/card/StatCard";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import StatusTag from "../common/status/StatusTag";
import DataTable from "../common/table/DataTable";
import RowActionMenu from "../common/table/RowActionMenu";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import PaymentsPanel from "../payment/PaymentsPanel";

const SupplierLedgerView = () => {
  const {
    supplier,
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

  if (!supplier) return null;

  const actionsOf = (row: IPayable): IRowAction[] =>
    permissions.encodeTransactions
      ? [
          {
            key: "mark-paid",
            label: row.status === "paid" ? "Already paid" : "Mark paid",
            icon: <CircleCheck />,
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
      mobile: "subtitle",
      dataIndex: "due_date",
      width: 120,
      render: (value: string) => formatDate(value),
    },
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Reference",
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

  return (
    <>
      <div className={ledgerHead}>
        <div className={ledgerHeadStart}>
          <AppButton variant="outline" onPress={closeSupplierDetail}>
            <ArrowLeft />
            Back to suppliers
          </AppButton>
          <h2 className={ledgerTitle}>{supplier.partyName}</h2>
        </div>
        <div className={ledgerHeadActions}>
          <AppButton
            variant="outline"
            onPress={() =>
              printStatement(
                "payable",
                supplier.partyName,
                summary,
                rows,
                payments,
                branchName
              )
            }
          >
            <Printer />
            Print statement
          </AppButton>
        </div>
      </div>

      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Outstanding balance"
            value={summary?.outstanding ?? 0}
            loading={summaryLoading}
            variant={
              summary && summary.outstanding > 0 ? "negative" : "positive"
            }
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Unpaid payables"
            value={summary?.unpaidCount ?? 0}
            loading={summaryLoading}
            raw
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Last payment"
            value={formatDate(lastPayment)}
            loading={lastPaymentLoading}
            raw
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Last transaction"
            value={formatDate(summary?.lastTransactionAt ?? null)}
            loading={summaryLoading}
            raw
          />
        </BentoCell>
      </BentoGrid>

      <LedgerFilterBar
        scope="supplier-ledger"
        showStatus
        statusValues={payableStatusValues}
      />

      <DataTable<IPayable>
        columns={columns}
        data={rows}
        loading={listLoading}
        pageSize={8}
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
};

export default SupplierLedgerView;
