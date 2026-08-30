import { Flex } from "antd";
import type { ReactNode } from "react";
import {
  filterToolbar,
  filterToolbarActions,
  filterToolbarStart,
} from "../../../styles/filter/filter.css";

type IProps = {
  actions?: ReactNode;
  children: ReactNode;
};

const FilterToolbar = ({ actions, children }: IProps) => {
  return (
    <Flex className={`${filterToolbar}`} align="center" gap="small" wrap>
      <Flex className={`${filterToolbarStart}`} align="center" gap="small" wrap>
        {children}
      </Flex>

      {actions ? (
        <Flex className={`${filterToolbarActions}`} align="center" gap="small">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  );
};

export default FilterToolbar;
