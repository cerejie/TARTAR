import type { ReactNode } from "react";
import type { BentoSpan } from "../../../models/common/view.model";
import { bentoCell } from "../../../styles/view/view.styles";

type IProps = {
  span?: BentoSpan;
  children: ReactNode;
};

const BentoCell = ({ span = "quarter", children }: IProps) => {
  return <div className={bentoCell({ span })}>{children}</div>;
};

export default BentoCell;
