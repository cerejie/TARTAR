import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterSelect } from "../../../styles/filter/filter.styles";

const anyValue = "__any__";

type IProps<T extends string> = {
  placeholder: string;
  value: T | undefined;
  values: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | undefined) => void;
};

const FilterSelect = <T extends string>({
  placeholder,
  value,
  values,
  labels,
  onChange,
}: IProps<T>) => {
  const selectValue = (key: unknown) =>
    onChange(values.find((item) => item === key));

  return (
    <Select
      aria-label={placeholder}
      value={value ?? anyValue}
      onChange={selectValue}
      className={filterSelect}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem id={anyValue}>{placeholder}</SelectItem>
          {values.map((item) => (
            <SelectItem key={item} id={item}>
              {labels[item]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FilterSelect;
