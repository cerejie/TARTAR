import { ArrowLeftRight, TrendingDown, TrendingUp } from "lucide-react";
import type { IDataTableColumn } from "../../models/common/table.model";
import type { ILedgerPayment } from "../../models/data/payment/payment.response";
import type {
  ICashFlowRow,
  IReportState,
} from "../../models/data/report/report.response";
import type { IDisbursement } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { cashFlowRows, cashFlowTotals } from "../../utils/report.utils";
import StatCard from "../common/card/StatCard";
import BentoCell from "../common/view/BentoCell";
import BentoGrid from "../common/view/BentoGrid";
import ReportRowsTable from "./tables/ReportRowsTable";

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
  transactions: IDisbursement[];
  customerPayments: ILedgerPayment[];
};

const CashFlowReport = ({
  transactions,
  customerPayments,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  const { inflow, outflow } = cashFlowTotals(transactions, customerPayments);

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

      <ReportRowsTable<ICashFlowRow>
        title="Cash Flow by Category"
        columns={columns}
        rows={cashFlowRows(transactions, customerPayments)}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={onRetry}
        rowKey="key"
      />
    </>
  );
};

export default CashFlowReport;
