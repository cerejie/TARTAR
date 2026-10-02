import type { IDataTableColumn } from "../../models/common/table.model";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import type {
  IExpenseRow,
  IReportState,
} from "../../models/data/report/report.response";
import type { IDisbursement } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { expenseRows } from "../../utils/report.utils";
import ReportRowsTable from "./tables/ReportRowsTable";

const columns: IDataTableColumn<IExpenseRow>[] = [
  { title: "Expense type", dataIndex: "label" },
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
  categories: IExpenseCategory[];
};

const ExpensesReport = ({
  transactions,
  categories,
  loading,
  refreshing,
  error,
  onRetry,
}: IProps) => {
  return (
    <ReportRowsTable<IExpenseRow>
      title="Expenses by Type"
      columns={columns}
      rows={expenseRows(transactions, categories)}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRetry={onRetry}
      rowKey="key"
    />
  );
};

export default ExpensesReport;
