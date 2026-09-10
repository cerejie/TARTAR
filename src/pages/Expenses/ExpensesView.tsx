import ContentView from "../../components/common/view/ContentView";
import ExpenseSummaryCards from "../../components/expense/cards/ExpenseSummaryCards";
import ExpensesTable from "../../components/expense/tables/ExpensesTable";

const ExpensesView = () => {
  return (
    <ContentView>
      <ExpenseSummaryCards />
      <ExpensesTable />
    </ContentView>
  );
};

export default ExpensesView;
