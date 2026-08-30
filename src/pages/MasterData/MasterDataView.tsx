import { Segmented } from "antd";
import ExpenseCategoriesPanel from "../../components/master-data/ExpenseCategoriesPanel";
import SuppliersPanel from "../../components/master-data/SuppliersPanel";
import ContentView from "../../components/common/view/ContentView";
import { useSearchParam } from "../../hook/common/search.param.hook";

const sections = ["suppliers", "expense-categories"] as const;
type Section = (typeof sections)[number];

const sectionLabels: Record<Section, string> = {
  suppliers: "Suppliers",
  "expense-categories": "Expense Categories",
};

const sectionSubtitles: Record<Section, string> = {
  suppliers: "Supplier records used by payables, purchases and vouchers",
  "expense-categories": "Categories offered when recording an expense",
};

const MasterDataView = () => {
  const { value: section, setValue: setSection } = useSearchParam<Section>(
    "section",
    sections,
    "suppliers"
  );

  return (
    <ContentView
      title="Master Data"
      subtitle={sectionSubtitles[section]}
      toolbar={
        <Segmented
          value={section}
          onChange={(value) => setSection(value as Section)}
          options={sections.map((item) => ({
            label: sectionLabels[item],
            value: item,
          }))}
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
