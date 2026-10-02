import { ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { IFormSummaryLine } from "../../../models/common/field.model";
import {
  formSummaryBar,
  formSummaryBarChevron,
  formSummaryBarLabel,
  formSummaryBarLines,
  formSummaryBarRow,
  formSummaryBarToggle,
  formSummaryBarTotal,
  formSummaryLine,
  formSummaryValue,
} from "../../../styles/form/form.styles";

type IProps = {
  lines: readonly IFormSummaryLine[];
};

const FormSummaryBar = ({ lines }: IProps) => {
  const totalLine = lines.find((line) => line.emphasis) ?? lines.at(-1);
  if (!totalLine) return null;

  const detailLines = lines.filter((line) => line !== totalLine);
  const total = (
    <>
      <span className={formSummaryBarLabel}>{totalLine.label}</span>
      <span className={formSummaryBarTotal}>{totalLine.value}</span>
    </>
  );

  if (detailLines.length === 0) {
    return <div className={formSummaryBarRow}>{total}</div>;
  }

  return (
    <Collapsible className={formSummaryBar}>
      <CollapsibleContent>
        <dl className={formSummaryBarLines}>
          {detailLines.map((line) => (
            <div key={line.key} className={formSummaryLine()}>
              <dt>{line.label}</dt>
              <dd className={formSummaryValue}>{line.value}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleContent>
      <CollapsibleTrigger className={formSummaryBarToggle}>
        {total}
        <ChevronUp className={formSummaryBarChevron} />
      </CollapsibleTrigger>
    </Collapsible>
  );
};

export default FormSummaryBar;
