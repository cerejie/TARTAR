import { Col, Row, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ledgerStatusColors,
  ledgerStatusLabels,
  type LedgerStatus,
} from "../../enums/ledger.enum";
import {
  isLedgerOverdue,
  ledgerBalance,
  type IPayable,
  type IReceivable,
} from "../../models/data/ledger/ledger.response";
import { rowOverdue } from "../../styles/table/table.css";
import { reportStats } from "../../styles/view/report/report.view.css";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { orderedLedger } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";

type IProps<Row extends IReceivable | IPayable> = {
  rows: Row[];
  loading: boolean;
  nameOf: (row: Row) => string;
  label: string;
};

const LedgerReport = <Row extends IReceivable | IPayable>({
  rows,
  loading,
  nameOf,
  label,
}: IProps<Row>) => {
  const outstanding = rows.reduce(
    (total, row) => total + ledgerBalance(row),
    0
  );
  const overdueRows = rows.filter(isLedgerOverdue);
  const overdueTotal = overdueRows.reduce(
    (total, row) => total + ledgerBalance(row),
    0
  );

  const columns: ColumnsType<Row> = [
    {
      title: "Due date",
      dataIndex: "due_date",
      render: (value: string) => formatDate(value),
    },
    { title: label, key: "name", render: (_, row) => nameOf(row) },
    { title: "Branch", dataIndex: "branch" },
    {
      title: "Amount",
      dataIndex: "amount",
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
      render: (status: LedgerStatus, row) =>
        isLedgerOverdue(row) ? (
          <Tag color="red">Overdue</Tag>
        ) : (
          <Tag color={ledgerStatusColors[status]}>
            {ledgerStatusLabels[status]}
          </Tag>
        ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} className={`${reportStats}`}>
        <Col xs={12} md={8}>
          <StatCard
            title="Total outstanding"
            value={outstanding}
            loading={loading}
            variant="brand"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Overdue balance"
            value={overdueTotal}
            loading={loading}
            variant="negative"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Overdue records"
            value={overdueRows.length}
            loading={loading}
            raw
          />
        </Col>
      </Row>

      <SectionCard
        title={`Outstanding ${label}s`}
        subtitle="Overdue items first, highlighted in red"
        flush
      >
        <DataTable<Row>
          columns={columns}
          data={orderedLedger(rows)}
          loading={loading}
          emptyText="Nothing outstanding"
          rowClassName={(row) => (isLedgerOverdue(row) ? `${rowOverdue}` : "")}
        />
      </SectionCard>
    </>
  );
};

export default LedgerReport;
