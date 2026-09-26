import type { ReactNode } from "react";
import { ChevronDown, Eraser, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  filterPill,
  filterPopover,
  filterPopoverHead,
  filterPopoverTitle,
} from "../../../styles/filter/filter.styles";

type IProps = {
  activeCount: number;
  onReset: () => void;
  children: ReactNode;
};

const FilterPopover = ({ activeCount, onReset, children }: IProps) => {
  return (
    <PopoverTrigger>
      <Button variant="outline" className={filterPill}>
        <SlidersHorizontal />
        Filters
        {activeCount > 0 ? <Badge>{activeCount}</Badge> : null}
        <ChevronDown />
      </Button>
      <Popover placement="bottom start" className={filterPopover}>
        <PopoverHeader className={filterPopoverHead}>
          <PopoverTitle className={filterPopoverTitle}>Filters</PopoverTitle>
          <Button
            variant="ghost"
            size="sm"
            isDisabled={activeCount === 0}
            onPress={onReset}
          >
            <Eraser />
            Reset
          </Button>
        </PopoverHeader>
        {children}
      </Popover>
    </PopoverTrigger>
  );
};

export default FilterPopover;
