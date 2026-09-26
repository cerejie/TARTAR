import type { ReactNode } from "react";
import {
  filterToolbar,
  filterToolbarActions,
  filterToolbarStart,
} from "../../../styles/filter/filter.styles";

type IProps = {
  actions?: ReactNode;
  children: ReactNode;
};

const FilterToolbar = ({ actions, children }: IProps) => {
  return (
    <div className={filterToolbar}>
      <div className={filterToolbarStart}>{children}</div>

      {actions ? <div className={filterToolbarActions}>{actions}</div> : null}
    </div>
  );
};

export default FilterToolbar;
