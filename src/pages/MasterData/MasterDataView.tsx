import ExpenseCategoriesPanel from "../../components/master-data/ExpenseCategoriesPanel";
import SuppliersPanel from "../../components/master-data/SuppliersPanel";
import ContentView from "../../components/common/view/ContentView";
import ViewSwitch from "../../components/common/view/ViewSwitch";
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
      toolbar={
        <ViewSwitch
          value={section}
          values={sections}
          labels={sectionLabels}
          onChange={setSection}
        />
      }
    >
      {section === "suppliers" ? (
        <SuppliersPanel />
      ) : (
        <ExpenseCategoriesPanel />
      )}
    </ContentView>
  );
};

export default MasterDataView;
