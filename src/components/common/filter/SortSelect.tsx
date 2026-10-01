import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ISortOption } from "../../../models/common/table.model";
import {
  filterSort,
  filterSortLabel,
  filterSortSelect,
  filterSortTrigger,
  filterSortValue,
} from "../../../styles/filter/filter.styles";

type IProps = {
  value: string;
  options: readonly ISortOption[];
  onChange: (key: string) => void;
};

const SortSelect = ({ value, options, onChange }: IProps) => {
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
