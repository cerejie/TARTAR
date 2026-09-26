import type { IDataTableColumn } from "../../models/common/table.model";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import type {
  IExpenseRow,
  IReportState,
} from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { expenseRows } from "../../utils/report.utils";
import DataTable from "../common/table/DataTable";
import TablePanel from "../common/table/TablePanel";

const columns: IDataTableColumn<IExpenseRow>[] = [
  { title: "Expense type", dataIndex: "label" },
  {
    title: "Total",
    dataIndex: "total",
    align: "right",
    render: (value: number) => formatMoney(value),
  },
];

type IProps = IReportState & {
  transactions: ITransaction[];
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
    <TablePanel title="Expenses by Type">
      <DataTable<IExpenseRow>
        columns={columns}
        data={expenseRows(transactions, categories)}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRetry={onRetry}
        rowKey="key"
      />
    </TablePanel>
  );
};

export default ExpensesReport;
