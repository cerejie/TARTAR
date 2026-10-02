import ContentView from "../../components/common/view/ContentView";
import DashboardBoard from "../../components/dashboard/views/DashboardBoard";
import { formatDate, todayIso } from "../../utils/format.utils";

const DashboardView = () => {
  return (
    <ContentView meta={formatDate(todayIso())}>
      <DashboardBoard />
    </ContentView>
  );
};

export default DashboardView;
