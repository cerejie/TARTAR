import {
  ArrowLeftOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Col, Flex, Row, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { customerDetailsModalKey } from "../../keys/modal.keys";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
} from "../../enums/ledger.enum";
import { useModalActions } from "../../hook/common/modal.hook";
import { useCustomerDetailHook } from "../../hook/data/ledger/customer.detail.hook";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import { cardTitle } from "../../styles/card/card.css";
import { statGrid } from "../../styles/stat/stat.css";
import { rowOverdue } from "../../styles/table/table.css";
import {
  ledgerHead,
  ledgerSection,
} from "../../styles/view/ledger/ledger.view.css";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { printStatement } from "../../utils/print.utils";
import StatCard from "../common/card/StatCard";
import LedgerFilterBar from "../common/filter/LedgerFilterBar";
import RequirePermission from "../common/guard/RequirePermission";
import DataTable from "../common/table/DataTable";
import PaymentsPanel from "../payment/PaymentsPanel";
import CustomerInfoModal from "./CustomerInfoModal";
import PaymentAllocationModal from "./PaymentAllocationModal";

const { Title } = Typography;

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

  const columns: ColumnsType<IReceivable> = [
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
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color={ledgerStatusColors[status]}>
            {ledgerStatusLabels[status]}
          </Tag>
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
      <Flex
        className={`${ledgerHead}`}
        align="center"
        gap="middle"
        wrap
        justify="space-between"
      >
        <Flex align="center" gap="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={closeLedgerDetail}>
            Back to customers
          </Button>
          <Title level={4} className={`${cardTitle}`}>
            {customer.customerName}
          </Title>
        </Flex>
        <Flex align="center" gap="small">
          <Tooltip title="Customer information">
            <Button
              icon={<InfoCircleOutlined />}
              aria-label={`Information for ${customer.customerName}`}
              onClick={() => infoModal.openModal()}
            />
          </Tooltip>
          <Button
            icon={<PrinterOutlined />}
            onClick={() =>
              printStatement(customer, summary, rows, payments, branchName)
            }
          >
            Print statement
          </Button>
          <RequirePermission can="encodeTransactions" fallback={null}>
            <Tooltip
              title={
                selectedRows.length
                  ? undefined
                  : "Tick the receivables being paid first"
              }
            >
              <span>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  disabled={selectedRows.length === 0}
                  onClick={() => paymentModal.openModal()}
                >
                  Record payment
                </Button>
              </span>
            </Tooltip>
          </RequirePermission>
        </Flex>
      </Flex>

      <Row gutter={[16, 16]} className={`${statGrid}`}>
        <Col xs={12} md={6}>
          <StatCard
            title="Outstanding balance"
            value={summary?.outstanding ?? 0}
            loading={summaryLoading}
            variant={
              summary && summary.outstanding > 0 ? "negative" : "positive"
            }
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Unpaid transactions"
            value={summary?.unpaidCount ?? 0}
            loading={summaryLoading}
            raw
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Last payment"
            value={formatDate(lastPayment)}
            loading={lastPaymentLoading}
            raw
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Last transaction"
            value={formatDate(summary?.lastTransactionAt ?? null)}
            loading={summaryLoading}
            raw
          />
        </Col>
      </Row>

      <LedgerFilterBar scope="customer-ledger" showStatus />

      <DataTable<IReceivable>
        columns={columns}
        data={rows}
        loading={listLoading}
        pageSize={10}
        emptyText="No receivables match the filters"
        rowClassName={(row) => (isLedgerOverdue(row) ? `${rowOverdue}` : "")}
        rowSelection={{
          selectedRowKeys: selection,
          onChange: (keys) => setSelection(keys as string[]),
          getCheckboxProps: (row) => ({ disabled: row.status === "paid" }),
        }}
      />

      <Title level={5} className={`${ledgerSection}`}>
        Payments
      </Title>
      <PaymentsPanel
        kind="receivable"
        party={{
          partyId: customer.customerId,
          partyName: customer.customerName,
        }}
        compact
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
