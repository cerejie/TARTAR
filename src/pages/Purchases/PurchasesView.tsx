import ContentView from "../../components/common/view/ContentView";
import PurchaseSummaryCards from "../../components/purchase/cards/PurchaseSummaryCards";
import PurchasesTable from "../../components/purchase/tables/PurchasesTable";

const PurchasesView = () => {
  return (
    <ContentView>
      <PurchaseSummaryCards />
      <PurchasesTable />
    </ContentView>
  );
};

export default PurchasesView;
