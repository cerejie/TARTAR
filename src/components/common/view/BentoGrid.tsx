import type { ReactNode } from "react";
import { bentoGrid } from "../../../styles/view/content/content.view.css";

type IProps = {
  children: ReactNode;
};

const BentoGrid = ({ children }: IProps) => {
  return <div className={`${bentoGrid}`}>{children}</div>;
};

export default BentoGrid;
