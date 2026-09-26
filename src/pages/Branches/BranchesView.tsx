import BranchesTable from "../../components/branch/tables/BranchesTable";
import BranchMonitorTable from "../../components/branch/tables/BranchMonitorTable";
import ContentView from "../../components/common/view/ContentView";

const BranchesView = () => {
  return (
    <ContentView>
      <BranchesTable />
      <BranchMonitorTable />
    </ContentView>
  );
};

export default BranchesView;
