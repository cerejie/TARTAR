import type { ReactNode } from "react";
import {
  filterToolbar,
  filterToolbarActions,
  filterToolbarStart,
} from "../../../styles/filter/filter.styles";

type IProps = {
  actions?: ReactNode;
  sort?: ReactNode;
  children: ReactNode;
};

const FilterToolbar = ({ actions, sort, children }: IProps) => {
  return (
    <div className={filterToolbar}>
      <div className={filterToolbarStart}>{children}</div>

      {actions || sort ? (
        <div className={filterToolbarActions}>
          {sort}
          {actions}
        </div>
      ) : null}
    </div>
  );
};

export default FilterToolbar;
