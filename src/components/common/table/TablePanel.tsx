import type { ReactNode } from "react";
import { tablePanel, tablePanelBody } from "../../../styles/table/table.styles";

type IProps = {
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

const TablePanel = ({ toolbar, footer, children }: IProps) => {
  return (
    <div className={tablePanel}>
      {toolbar}

      <div className={tablePanelBody}>{children}</div>

      {footer}
    </div>
  );
};

export default TablePanel;
