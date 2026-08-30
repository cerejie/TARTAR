import { Flex } from "antd";
import type { ReactNode } from "react";
import {
  filterToolbar,
  filterToolbarActions,
  filterToolbarCard,
} from "../../../styles/filter/filter.css";
import SectionCard from "../card/SectionCard";

type IProps = {
  actions?: ReactNode;
  children: ReactNode;
};

const FilterToolbar = ({ actions, children }: IProps) => {
  return (
    <Flex className={`${filterToolbar}`} align="center" gap="small" wrap>
      <div className={`${filterToolbarCard}`}>
        <SectionCard dense>{children}</SectionCard>
      </div>

      {actions ? (
        <Flex className={`${filterToolbarActions}`} align="center" gap="small">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  );
};

export default FilterToolbar;
