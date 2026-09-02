import ContentView from "../../components/common/view/ContentView";
import TransactionSummaryCards from "../../components/transaction/cards/TransactionSummaryCards";
import TransactionsTable from "../../components/transaction/tables/TransactionsTable";

const TransactionsView = () => {
  return (
    <ContentView>
      <TransactionSummaryCards />
      <TransactionsTable />
    </ContentView>
  );
};

export default TransactionsView;
