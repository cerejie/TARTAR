import { useAdminHomeHook } from "../../../hook/data/admin/admin.home.hook";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import AdminPageTitle from "../../common/layout/AdminPageTitle";
import ContextSwitch from "../../common/view/ContextSwitch";
import AttentionList from "../../dashboard/AttentionList";
import OverviewTiles from "./OverviewTiles";
import SalesTrendCard from "./SalesTrendCard";

const AdminHomeOverview = () => {
  const home = useAdminHomeHook();

  return (
    <div className={adminTabStack}>
      <AdminPageTitle />
      <AttentionList
        items={home.attentionItems}
        loading={home.attentionLoading}
        refreshing={home.attentionRefreshing}
        error={home.attentionError}
        onRetry={home.retryAttention}
        onOpen={home.openAttentionItem}
      />
      <ContextSwitch
        label="Overview period"
        value={home.period}
        options={home.periodOptions}
        onChange={home.setPeriod}
      />
      <OverviewTiles
        sales={home.sales}
        expenses={home.expenses}
        arOutstanding={home.arOutstanding}
        arNew={home.arNew}
        apOutstanding={home.apOutstanding}
        apNew={home.apNew}
        showNewAmounts={home.showNewAmounts}
        periodCaption={home.periodCaption}
        receivablesPath={home.receivablesPath}
        payablesPath={home.payablesPath}
        loading={home.overviewLoading}
        error={home.overviewError}
        onRetry={home.retryOverview}
      />
      <SalesTrendCard
        salesPeriod={home.salesPeriod}
        series={home.series}
        loading={home.salesLoading}
        error={home.salesError}
        onRetry={home.retrySales}
      />
    </div>
  );
};

export default AdminHomeOverview;
