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
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { filterSheetModalKey } from "../../../keys/modal.keys";
import {
  filterPill,
  filterPillBadge,
  filterPillLabel,
  filterPopover,
  filterPopoverHead,
  filterPopoverTitle,
  filterSection,
  filterSectionTitle,
  filterSections,
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
  quick?: ReactNode;
  children: ReactNode;
};

const FilterPopover = ({ activeCount, onReset, quick, children }: IProps) => {
  const isCompact = useIsCompact();
  const sheet = useModal(filterSheetModalKey(useId()));

  const handleOpenChange = (next: boolean) => {
    if (!next) sheet.closeModal();
  };

  const trigger = (
    <Button
      variant="outline"
      className={filterPill}
      onPress={isCompact ? () => sheet.openModal() : undefined}
    >
      <SlidersHorizontal />
      <span className={filterPillLabel}>Filters</span>
      {activeCount > 0 ? (
        <Badge className={filterPillBadge}>{activeCount}</Badge>
      ) : null}
      {isCompact ? null : <ChevronDown />}
    </Button>
  );

  const body = quick ? (
    <div className={filterSections}>
      <section className={filterSection}>
        <h3 className={filterSectionTitle}>Quick filters</h3>
        {quick}
      </section>
      <section className={filterSection}>
        <h3 className={filterSectionTitle}>Advanced</h3>
        {children}
      </section>
    </div>
  ) : (
    children
  );

  const resetButton = (variant: "ghost" | "outline", size: "sm" | "default") => (
    <Button variant={variant} size={size} isDisabled={activeCount === 0} onPress={onReset}>
      <Eraser />
      Reset
    </Button>
  );

  if (isCompact) {
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
          <div className={drawerBody}>{body}</div>
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
        {body}
      </Popover>
    </PopoverTrigger>
  );
};

export default FilterPopover;
