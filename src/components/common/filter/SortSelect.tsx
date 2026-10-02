import { useId } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import { useModal } from "../../../hook/common/modal.hook";
import { sortSheetModalKey } from "../../../keys/modal.keys";
import type { ISortOption } from "../../../models/common/table.model";
import {
  filterPill,
  filterSort,
  filterSortLabel,
  filterSortSelect,
  filterSortTrigger,
  filterSortValue,
  sortSheetList,
  sortSheetOption,
} from "../../../styles/filter/filter.styles";
import AppSheet from "../app/AppSheet";

type IProps = {
  value: string;
  options: readonly ISortOption[];
  onChange: (key: string) => void;
};

const SortSelect = ({ value, options, onChange }: IProps) => {
  const isCompact = useIsCompact();
  const sheet = useModal(sortSheetModalKey(useId()));

  const chooseOption = (key: string) => {
    onChange(key);
    sheet.closeModal();
  };

  if (isCompact) {
    const current = options.find((option) => option.key === value);

    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className={filterPill}
          aria-label={current ? `Sort by ${current.label}` : "Sort by"}
          onPress={() => sheet.openModal()}
        >
          <ArrowUpDown />
        </Button>
        <AppSheet open={sheet.modal.visible} title="Sort by" onClose={sheet.closeModal}>
          <div role="group" aria-label="Sort by" className={sortSheetList}>
            {options.map((option) => (
              <Button
                key={option.key}
                variant="ghost"
                className={sortSheetOption}
                aria-pressed={option.key === value}
                onPress={() => chooseOption(option.key)}
              >
                {option.label}
                {option.key === value ? <Check /> : null}
              </Button>
            ))}
          </div>
        </AppSheet>
      </>
    );
  }

  const selectOption = (key: unknown) => {
    const option = options.find((item) => item.key === key);
    if (option) onChange(option.key);
  };

  return (
    <div className={filterSort}>
      <span className={filterSortLabel}>Sort by:</span>
      <Select
        aria-label="Sort by"
        value={value}
        onChange={selectOption}
        className={filterSortSelect}
      >
        <SelectTrigger className={filterSortTrigger}>
          <span className={filterSortValue}>
            <ArrowUpDown />
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.key} id={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelect;
