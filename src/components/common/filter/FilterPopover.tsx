import { useId } from "react";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hook/use-mobile";
import { useModal } from "../../../hook/common/modal.hook";
import { filterSheetModalKey } from "../../../keys/modal.keys";
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
  const sheet = useModal(filterSheetModalKey(useId()));

  const handleOpenChange = (next: boolean) => {
    if (!next) sheet.closeModal();
  };

  const trigger = (
    <Button
      variant="outline"
      className={filterPill}
      onPress={isMobile ? () => sheet.openModal() : undefined}
    >
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
      <>
        {trigger}
        <Sheet
          side="bottom"
          isOpen={sheet.modal.visible}
          onOpenChange={handleOpenChange}
          className={drawerContent}
        >
          <SheetHeader className={drawerHeaderRuled}>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className={drawerBody}>{children}</div>
          <SheetFooter className={filterSheetFooter}>
            {resetButton("outline", "default")}
            <Button onPress={sheet.closeModal}>Show results</Button>
          </SheetFooter>
        </Sheet>
      </>
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
