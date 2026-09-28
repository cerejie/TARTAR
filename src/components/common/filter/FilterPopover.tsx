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
  Sheet,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hook/use-mobile";
import {
  filterPill,
  filterPopover,
  filterPopoverHead,
  filterPopoverTitle,
  filterSheetFooter,
} from "../../../styles/filter/filter.styles";
import {
  drawerBody,
  drawerContent,
  drawerHeaderRuled,
} from "../../../styles/modal/modal.styles";

type IProps = {
  activeCount: number;
  onReset: () => void;
  children: ReactNode;
};

const FilterPopover = ({ activeCount, onReset, children }: IProps) => {
  const isMobile = useIsMobile();

  const trigger = (
    <Button variant="outline" className={filterPill}>
      <SlidersHorizontal />
      Filters
      {activeCount > 0 ? <Badge>{activeCount}</Badge> : null}
      <ChevronDown />
    </Button>
  );

  const resetButton = (variant: "ghost" | "outline", size: "sm" | "default") => (
    <Button variant={variant} size={size} isDisabled={activeCount === 0} onPress={onReset}>
      <Eraser />
      Reset
    </Button>
  );

  if (isMobile) {
    return (
      <SheetTrigger>
        {trigger}
        <Sheet side="bottom" className={drawerContent}>
          <SheetHeader className={drawerHeaderRuled}>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className={drawerBody}>{children}</div>
          <SheetFooter className={filterSheetFooter}>
            {resetButton("outline", "default")}
            <SheetClose variant="default">Show results</SheetClose>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>
    );
  }

  return (
    <PopoverTrigger>
      {trigger}
      <Popover placement="bottom start" className={filterPopover}>
        <PopoverHeader className={filterPopoverHead}>
          <PopoverTitle className={filterPopoverTitle}>Filters</PopoverTitle>
          {resetButton("ghost", "sm")}
        </PopoverHeader>
        {children}
      </Popover>
    </PopoverTrigger>
  );
};

export default FilterPopover;
