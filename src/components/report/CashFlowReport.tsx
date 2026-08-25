import { Col, Row } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  cashInflowTypes,
  cashOutflowTypes,
} from "../../enums/transaction.enum";
import type { ICashFlowRow } from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { reportStats } from "../../styles/view/report/report.view.css";
import { formatMoney } from "../../utils/format.utils";
import { cashFlowRows, sumBy } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";

const columns: ColumnsType<ICashFlowRow> = [
  { title: "Category", dataIndex: "label" },
  { title: "Direction", dataIndex: "direction" },
  {
    title: "Total",
    dataIndex: "total",
    align: "right",
    render: (value: number) => formatMoney(value),
  },
];

type IProps = {
  transactions: ITransaction[];
  loading: boolean;
};

const CashFlowReport = ({ transactions, loading }: IProps) => {
  const inflow = sumBy(transactions, (row) =>
    cashInflowTypes.includes(row.type)
  );
  const outflow = sumBy(transactions, (row) =>
    cashOutflowTypes.includes(row.type)
  );

  return (
    <>
      <Row gutter={[16, 16]} className={`${reportStats}`}>
        <Col xs={12} md={8}>
          <StatCard
            title="Cash In"
            value={inflow}
            loading={loading}
            variant="positive"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Cash Out"
            value={outflow}
            loading={loading}
            variant="negative"
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Net Cash Flow"
            value={inflow - outflow}
            loading={loading}
            variant="brand"
          />
        </Col>
      </Row>

      <SectionCard
        title="Cash Flow by Category"
        subtitle="Inflows and outflows by transaction type"
        flush
      >
        <DataTable<ICashFlowRow>
          columns={columns}
          data={cashFlowRows(transactions)}
          loading={loading}
          rowKey="key"
        />
      </SectionCard>
    </>
  );
};

export default CashFlowReport;
