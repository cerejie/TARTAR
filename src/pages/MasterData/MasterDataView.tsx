import type { ReactNode } from "react";
import ContentView from "../../components/common/view/ContentView";
import ContextSwitch from "../../components/common/view/ContextSwitch";
import BankAccountCreateButton from "../../components/master-data/menus/BankAccountCreateButton";
import ExpenseCategoryCreateButton from "../../components/master-data/menus/ExpenseCategoryCreateButton";
import IncomeSourceCreateButton from "../../components/master-data/menus/IncomeSourceCreateButton";
import SupplierCreateButton from "../../components/master-data/menus/SupplierCreateButton";
import BankAccountsTable from "../../components/master-data/tables/BankAccountsTable";
import ExpenseCategoriesTable from "../../components/master-data/tables/ExpenseCategoriesTable";
import IncomeSourcesTable from "../../components/master-data/tables/IncomeSourcesTable";
import SuppliersTable from "../../components/master-data/tables/SuppliersTable";
import { useSearchParam } from "../../hook/common/search.param.hook";
import { segmentOptionsOf } from "../../utils/segment.utils";

const sections = [
  "suppliers",
  "expense-categories",
  "income-sources",
  "banks",
] as const;
type Section = (typeof sections)[number];

const sectionLabels: Record<Section, string> = {
  suppliers: "Suppliers",
  "expense-categories": "Expense Categories",
  "income-sources": "Income Sources",
  banks: "Banks",
};

const sectionActions: Record<Section, ReactNode> = {
  suppliers: <SupplierCreateButton />,
  "expense-categories": <ExpenseCategoryCreateButton />,
  "income-sources": <IncomeSourceCreateButton />,
  banks: <BankAccountCreateButton />,
};

const sectionTables: Record<Section, ReactNode> = {
  suppliers: <SuppliersTable />,
  "expense-categories": <ExpenseCategoriesTable />,
  "income-sources": <IncomeSourcesTable />,
  banks: <BankAccountsTable />,
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
        <ContextSwitch
          label="Section"
          value={section}
          options={segmentOptionsOf(sections, sectionLabels)}
          onChange={setSection}
        />
      }
      actions={sectionActions[section]}
    >
      {sectionTables[section]}
    </ContentView>
  );
};

export default MasterDataView;
