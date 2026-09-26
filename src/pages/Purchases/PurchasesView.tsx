import ContentView from "../../components/common/view/ContentView";
import VoucherStatusTabs from "../../components/disbursement/menus/VoucherStatusTabs";
import PurchaseSummaryCards from "../../components/purchase/cards/PurchaseSummaryCards";
import PurchasesTable from "../../components/purchase/tables/PurchasesTable";

const PurchasesView = () => {
  return (
    <ContentView tabs={<VoucherStatusTabs kind="purchase" />}>
      <PurchaseSummaryCards />
      <PurchasesTable />
    </ContentView>
  );
};

export default PurchasesView;
