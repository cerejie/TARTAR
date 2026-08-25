import { Col, Row } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  transactionTypeLabels,
  type TransactionType,
} from "../../enums/transaction.enum";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { reportStats } from "../../styles/view/report/report.view.css";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { sumBy } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";

const columns: ColumnsType<ITransaction> = [
  {
    title: "Date",
    dataIndex: "txn_date",
    render: (value: string) => formatDate(value),
  },
  {
    title: "Type",
    dataIndex: "type",
    render: (type: TransactionType) => transactionTypeLabels[type],
  },
  { title: "Branch", dataIndex: "branch" },
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
];

type IProps = {
  transactions: ITransaction[];
  loading: boolean;
};

const PeriodReport = ({ transactions, loading }: IProps) => {
  const sales = sumBy(transactions, (row) => row.type === "sale");
  const expenses = sumBy(transactions, (row) => row.type === "expense");

  return (
    <>
      <Row gutter={[16, 16]} className={`${reportStats}`}>
        <Col xs={12} md={8}>
          <StatCard
            title="Sales"
            value={sales}
            loading={loading}
            variant="positive"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Expenses"
            value={expenses}
            loading={loading}
            variant="negative"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Net"
            value={sales - expenses}
            loading={loading}
            variant="brand"
          />
        </Col>
      </Row>

      <SectionCard
        title="Transactions"
        subtitle="Every movement in the selected period"
        flush
      >
        <DataTable<ITransaction>
          columns={columns}
          data={transactions}
          loading={loading}
          emptyText="No transactions in this period"
        />
      </SectionCard>
    </>
  );
};

export default PeriodReport;
