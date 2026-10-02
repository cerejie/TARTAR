import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  recordSheetSection,
  recordSheetSectionChevron,
  recordSheetSectionTitle,
  recordSheetSectionToggle,
} from "../../../styles/app/app.styles";
import DetailRows from "../app/DetailRows";

import type { IDetailSection } from "../../../models/common/detail.model";

type IProps<T> = {
  section: IDetailSection<T>;
  record: T;
};

const RecordDetailSection = <T,>({ section, record }: IProps<T>) => {
  if (!section.disclosure) {
    return (
      <section className={recordSheetSection}>
        <h3 className={recordSheetSectionTitle}>
          {section.icon}
          {section.title}
        </h3>
        <DetailRows record={record} items={section.items} />
      </section>
    );
  }

  return (
    <Collapsible
      className={recordSheetSection}
      defaultExpanded={section.disclosure === "expanded"}
    >
      <CollapsibleTrigger className={recordSheetSectionToggle}>
        {section.icon}
        {section.title}
        <ChevronDown className={recordSheetSectionChevron} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <DetailRows record={record} items={section.items} />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RecordDetailSection;
