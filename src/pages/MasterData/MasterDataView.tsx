import ContentView from "../../components/common/view/ContentView";
import ViewSwitch from "../../components/common/view/ViewSwitch";
import ExpenseCategoriesTable from "../../components/master-data/tables/ExpenseCategoriesTable";
import SuppliersTable from "../../components/master-data/tables/SuppliersTable";
import { useSearchParam } from "../../hook/common/search.param.hook";

const sections = ["suppliers", "expense-categories"] as const;
type Section = (typeof sections)[number];

const sectionLabels: Record<Section, string> = {
  suppliers: "Suppliers",
  "expense-categories": "Expense Categories",
};

const MasterDataView = () => {
  const { value: section, setValue: setSection } = useSearchParam<Section>(
    "section",
    sections,
    "suppliers"
  );

  return (
    <ContentView
      tabs={
        <ViewSwitch
          value={section}
          values={sections}
          labels={sectionLabels}
          onChange={setSection}
        />
      }
    >
      {section === "suppliers" ? (
        <SuppliersTable />
      ) : (
        <ExpenseCategoriesTable />
      )}
    </ContentView>
  );
};

export default MasterDataView;
