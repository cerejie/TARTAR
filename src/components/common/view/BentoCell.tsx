import type { ReactNode } from "react";
import type { BentoSpan } from "../../../models/common/view.model";
import {
  bentoCell,
  bentoSpan,
} from "../../../styles/view/content/content.view.css";

type IProps = {
  span?: BentoSpan;
  children: ReactNode;
};

const BentoCell = ({ span = "quarter", children }: IProps) => {
  return (
    <div className={`${bentoCell} ${bentoSpan[span]}`}>{children}</div>
  );
};

export default BentoCell;
