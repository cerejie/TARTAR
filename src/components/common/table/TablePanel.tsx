import type { ReactNode } from "react";
import {
  tablePanel,
  tablePanelBody,
  tablePanelTitle,
} from "../../../styles/table/table.styles";

type IProps = {
  title?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const TablePanel = ({ title, toolbar, footer, children }: IProps) => {
  return (
    <div className={tablePanel}>
      {title ? <h2 className={tablePanelTitle}>{title}</h2> : null}
      {toolbar}

      <div className={tablePanelBody}>{children}</div>

      {footer}
    </div>
  );
};

export default TablePanel;
