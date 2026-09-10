import type { ReactNode } from "react";
import {
  tablePanel,
  tablePanelBody,
  tablePanelFooter,
  tablePanelToolbar,
} from "../../../styles/table/table.css";

type IProps = {
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const TablePanel = ({ toolbar, footer, children }: IProps) => {
  return (
    <div className={`${tablePanel}`}>
      {toolbar ? <div className={`${tablePanelToolbar}`}>{toolbar}</div> : null}

      <div className={`${tablePanelBody}`}>{children}</div>

      {footer ? <div className={`${tablePanelFooter}`}>{footer}</div> : null}
    </div>
  );
};

export default TablePanel;
