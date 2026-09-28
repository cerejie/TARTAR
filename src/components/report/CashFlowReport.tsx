import { ArrowLeftRight, TrendingDown, TrendingUp } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  cashInflowTypes,
  cashOutflowTypes,
} from "../../enums/transaction.enum";
import type {
  ICashFlowRow,
  IReportState,
} from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { cashFlowRows, sumBy } from "../../utils/report.utils";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";
import TablePanel from "../common/table/TablePanel";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";

const columns: IDataTableColumn<ICashFlowRow>[] = [
  { title: "Category", dataIndex: "label" },
  { title: "Direction", dataIndex: "direction" },
  {
    title: "Total",
    mobile: "amount",
    dataIndex: "total",
    align: "right",
    render: (value: number) => formatMoney(value),
  },
];

type IProps = IReportState & {
  transactions: ITransaction[];
};

const CashFlowReport = ({
  transactions,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  const inflow = sumBy(transactions, (row) =>
    cashInflowTypes.includes(row.type)
  );
  const outflow = sumBy(transactions, (row) =>
    cashOutflowTypes.includes(row.type)
  );

  return (
    <>
      <BentoGrid>
        <BentoCell span="third">
          <StatCard
            title="Cash In"
            value={inflow}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="positive"
            icon={<TrendingUp />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Cash Out"
            value={outflow}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="negative"
            icon={<TrendingDown />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Net Cash Flow"
            value={inflow - outflow}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="brand"
            icon={<ArrowLeftRight />}
          />
        </BentoCell>
      </BentoGrid>

      <TablePanel title="Cash Flow by Category">
        <DataTable<ICashFlowRow>
          columns={columns}
          data={cashFlowRows(transactions)}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={onRetry}
          rowKey="key"
        />
      </TablePanel>
    </>
  );
};

export default CashFlowReport;
