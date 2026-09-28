import ContentView from "../../components/common/view/ContentView";
import SaleSummaryCards from "../../components/sale/cards/SaleSummaryCards";
import SaleStatusTabs from "../../components/sale/menus/SaleStatusTabs";
import SalesTable from "../../components/sale/tables/SalesTable";

const SalesView = () => {
  return (
    <ContentView tabs={<SaleStatusTabs />}>
      <SaleSummaryCards />
      <SalesTable />
    </ContentView>
  );
};

export default SalesView;
