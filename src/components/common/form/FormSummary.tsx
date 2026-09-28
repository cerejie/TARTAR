import type { IFormSummaryLine } from "../../../models/common/field.model";
import {
  formSummary,
  formSummaryLine,
  formSummaryValue,
} from "../../../styles/form/form.styles";

type IProps = {
  lines: readonly IFormSummaryLine[];
};

const FormSummary = ({ lines }: IProps) => {
  return (
    <dl className={formSummary}>
      {lines.map((line) => (
        <div
          key={line.key}
          className={formSummaryLine({ emphasis: !!line.emphasis })}
        >
          <dt>{line.label}</dt>
          <dd className={formSummaryValue}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default FormSummary;
