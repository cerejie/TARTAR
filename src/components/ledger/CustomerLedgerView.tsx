import { ArrowLeft, CircleDollarSign, Info, Printer } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import { customerDetailsModalKey } from "../../keys/modal.keys";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
} from "../../enums/ledger.enum";
import StatusTag from "../common/status/StatusTag";
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
  ledgerSectionTitle,
  ledgerTitle,
} from "../../styles/ledger/ledger.styles";
import { dataTableRowOverdue } from "../../styles/table/table.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { printStatement } from "../../utils/print.utils";
import AppButton from "../common/button/AppButton";
import StatCard from "../common/card/StatCard";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import PaymentsPanel from "../payment/PaymentsPanel";
import CustomerInfoModal from "./CustomerInfoModal";
import PaymentAllocationModal from "./PaymentAllocationModal";

const CustomerLedgerView = () => {
  const {
    customer,
    permissions,
    rows,
    selection,
    selectedRows,
    setSelection,
    summary,
    summaryLoading,
    listLoading,
    lastPayment,
    lastPaymentLoading,
    payments,
    branchName,
    userNameOf,
    paymentModal,
    infoModal,
    recordPaymentMutation,
    closeLedgerDetail,
  } = useCustomerDetailHook();

  const { openModal } = useModalActions();

  if (!customer) return null;

  const columns: IDataTableColumn<IReceivable>[] = [
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
    { title: "Branch", dataIndex: "branch", render: branchName },
    {
      title: "Reference",
      dataIndex: "reference_number",
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
      dataIndex: "paid_amount",
      align: "right",
      render: (value: number) => formatMoney(value),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, row) => formatMoney(ledgerBalance(row)),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: IReceivable["status"], row) =>
        isLedgerOverdue(row) ? (
          <StatusTag color="negative" label="Overdue" />
        ) : (
          <StatusTag color={ledgerStatusColors[status]} label={ledgerStatusLabels[status]} />
        ),
    },
    ...(permissions.isManager
      ? [
          {
            title: "Created by",
            key: "created_by",
            render: (_: unknown, row: IReceivable) =>
              userNameOf(row.created_by),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className={ledgerHead}>
        <div className={ledgerHeadStart}>
          <AppButton variant="outline" onPress={closeLedgerDetail}>
            <ArrowLeft />
            Back to customers
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
            onPress={() =>
              printStatement(customer, summary, rows, payments, branchName)
            }
          >
            <Printer />
            Print statement
          </AppButton>
          <RequirePermission can="encodeTransactions" fallback={null}>
            <AppButton
              disabled={selectedRows.length === 0}
              onPress={() => paymentModal.openModal()}
            >
              <CircleDollarSign />
              {selectedRows.length === 0
                ? "Tick receivables to pay"
                : "Record payment"}
            </AppButton>
          </RequirePermission>
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
            title="Unpaid transactions"
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

      <LedgerFilterBar scope="customer-ledger" showStatus showOverdue />

      <DataTable<IReceivable>
        columns={columns}
        data={rows}
        loading={listLoading}
        pageSize={8}
        emptyText="No receivables match the filters"
        rowClassName={(row) => (isLedgerOverdue(row) ? dataTableRowOverdue : "")}
        rowSelection={{
          selectedRowKeys: selection,
          onChange: (keys) => setSelection(keys as string[]),
          getCheckboxProps: (row) => ({ disabled: row.status === "paid" }),
        }}
      />

      <h3 className={ledgerSectionTitle}>Payments</h3>
      <PaymentsPanel
        kind="receivable"
        party={{
          partyId: customer.customerId,
          partyName: customer.customerName,
        }}
      />

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
};

export default CustomerLedgerView;
