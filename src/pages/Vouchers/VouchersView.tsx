import ContentView from "../../components/common/view/ContentView";
import VouchersStatusTabs from "../../components/voucher/menus/VouchersStatusTabs";
import VouchersTable from "../../components/voucher/tables/VouchersTable";

const VouchersView = () => {
  return (
    <ContentView tabs={<VouchersStatusTabs />}>
      <VouchersTable />
    </ContentView>
  );
};

export default VouchersView;
