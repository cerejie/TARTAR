import type { ColumnsType } from "antd/es/table";
import type { IExpenseCategory } from "../../models/data/expense-category/expense.category.response";
import type { IExpenseRow } from "../../models/data/report/report.response";
import type { ITransaction } from "../../models/data/transaction/transaction.response";
import { formatMoney } from "../../utils/format.utils";
import { expenseRows } from "../../utils/report.utils";
import SectionCard from "../common/card/SectionCard";
import DataTable from "../common/table/DataTable";

const columns: ColumnsType<IExpenseRow> = [
  { title: "Expense type", dataIndex: "label" },
  {
    title: "Total",
    dataIndex: "total",
    align: "right",
    render: (value: number) => formatMoney(value),
  },
];

type IProps = {
  transactions: ITransaction[];
  categories: IExpenseCategory[];
  loading: boolean;
};

const ExpensesReport = ({ transactions, categories, loading }: IProps) => {
  return (
    <SectionCard
      title="Expenses by Type"
      subtitle="Totals for the selected period"
      flush
    >
      <DataTable<IExpenseRow>
        columns={columns}
        data={expenseRows(transactions, categories)}
        loading={loading}
        rowKey="key"
      />
    </SectionCard>
  );
};

export default ExpensesReport;
