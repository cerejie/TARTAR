import type { IDataTableColumn } from "../../models/common/table.model";
import {
  transactionTypeLabels,
  type TransactionType,
} from "../../enums/transaction.enum";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { sumBy } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import StatCard from "../common/card/StatCard";
import DataTable from "../common/table/DataTable";
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

type IProps = {
  transactions: ITransaction[];
  loading: boolean;
};

const PeriodReport = ({ transactions, loading }: IProps) => {
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
            variant="positive"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Expenses"
            value={expenses}
            loading={loading}
            variant="negative"
          />
        </BentoCell>
        <BentoCell span="third">
          <StatCard
            title="Net"
            value={sales - expenses}
            loading={loading}
            variant="brand"
          />
        </BentoCell>
      </BentoGrid>

      <SectionCard
        title="Transactions"
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
