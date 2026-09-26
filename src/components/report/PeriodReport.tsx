import { ArrowLeftRight, TrendingDown, TrendingUp } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  transactionTypeLabels,
  type TransactionType,
} from "../../enums/transaction.enum";
import type { IReportState } from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { sumBy } from "../../utils/report.utils";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";
import TablePanel from "../common/table/TablePanel";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";

const columns: IDataTableColumn<ITransaction>[] = [
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

type IProps = IReportState & {
  transactions: ITransaction[];
};

const PeriodReport = ({
  transactions,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  const sales = sumBy(transactions, (row) => row.type === "sale");
  const expenses = sumBy(transactions, (row) => row.type === "expense");

  return (
    <>
      <BentoGrid>
        <BentoCell span="third">
          <StatCard
            title="Sales"
            value={sales}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="positive"
            icon={<TrendingUp />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Expenses"
            value={expenses}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="negative"
            icon={<TrendingDown />}
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Net"
            value={sales - expenses}
            loading={loading}
            error={error}
            onRetry={onRetry}
            variant="brand"
            icon={<ArrowLeftRight />}
          />
        </BentoCell>
      </BentoGrid>

      <TablePanel title="Transactions">
        <DataTable<ITransaction>
          columns={columns}
          data={transactions}
          loading={loading}
          refreshing={refreshing}
          error={error}
          onRetry={onRetry}
          emptyText="No transactions in this period"
        />
      </TablePanel>
    </>
  );
};

export default PeriodReport;
