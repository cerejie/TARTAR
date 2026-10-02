import { ArrowLeftRight, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import {
  transactionTypeLabels,
  type TransactionType,
} from "../../enums/transaction.enum";
import type { IReportState } from "../../models/data/report/report.response";
import type { IDisbursement } from "../../models/data/transaction/transaction.response";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { periodTotals } from "../../utils/report.utils";
import StatCard from "../common/card/StatCard";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import ReportRowsTable from "./tables/ReportRowsTable";

type IProps = IReportState & {
  transactions: IDisbursement[];
  branchNameOf: (slug: string) => string;
};

const PeriodReport = ({
  transactions,
  branchNameOf,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  const totals = periodTotals(transactions);
  const cardState = { loading, error, onRetry };

  const columns: IDataTableColumn<IDisbursement>[] = [
    {
      title: "Date",
      dataIndex: "txn_date",
      render: (value: string) => formatDate(value),
    },
    {
      title: "Type",
      mobile: "status",
      dataIndex: "type",
      render: (type: TransactionType) => transactionTypeLabels[type],
    },
    {
      title: "Branch",
      dataIndex: "branch",
      render: (value: string) => branchNameOf(value),
    },
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
      render: (value: number) => formatMoney(value),
    },
  ];

  return (
    <>
      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Sales"
            value={totals.sales}
            {...cardState}
            variant="positive"
            icon={<TrendingUp />}
            caption={`${formatMoney(totals.pendingSales)} pending verification`}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Expenses"
            value={totals.expenses}
            {...cardState}
            variant="negative"
            icon={<TrendingDown />}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Purchases"
            value={totals.purchases}
            {...cardState}
            variant="negative"
            icon={<ShoppingCart />}
          />
        </BentoCell>
        <BentoCell span="quarter">
          <StatCard
            title="Net"
            value={totals.net}
            {...cardState}
            variant="brand"
            icon={<ArrowLeftRight />}
          />
        </BentoCell>
      </BentoGrid>

      <ReportRowsTable<IDisbursement>
        title="Transactions"
        columns={columns}
        rows={transactions}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={onRetry}
        emptyText="No transactions in this period"
      />
    </>
  );
};

export default PeriodReport;
