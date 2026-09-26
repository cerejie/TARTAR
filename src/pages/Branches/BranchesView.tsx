import BranchCreateButton from "../../components/branch/menus/BranchCreateButton";
import BranchesTable from "../../components/branch/tables/BranchesTable";
import BranchMonitorTable from "../../components/branch/tables/BranchMonitorTable";
import ContentView from "../../components/common/view/ContentView";

const BranchesView = () => {
  return (
    <ContentView actions={<BranchCreateButton />}>
      <BranchesTable />
      <BranchMonitorTable />
    </ContentView>
  );
};

export default BranchesView;
