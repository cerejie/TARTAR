import ContentView from "../../components/common/view/ContentView";
import VoucherStatusTabs from "../../components/disbursement/menus/VoucherStatusTabs";
import ExpenseSummaryCards from "../../components/expense/cards/ExpenseSummaryCards";
import ExpensesTable from "../../components/expense/tables/ExpensesTable";

const ExpensesView = () => {
  return (
    <ContentView tabs={<VoucherStatusTabs kind="expense" />}>
      <ExpenseSummaryCards />
      <ExpensesTable />
    </ContentView>
  );
};

export default ExpensesView;
