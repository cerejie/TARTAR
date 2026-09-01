import { Card } from "antd";
import ContentView from "../../components/common/view/ContentView";
import TransactionsTable from "../../components/transaction/tables/TransactionsTable";

const TransactionsView = () => {
  return (
    <ContentView>
      <Card>      <TransactionsTable /></Card>

    </ContentView>
  );
};

export default TransactionsView;
