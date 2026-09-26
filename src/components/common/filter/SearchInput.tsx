import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { filterSearch } from "../../../styles/filter/filter.styles";

type IProps = {
  value: string | undefined;
  placeholder: string;
  onChange: (value: string | undefined) => void;
};

const SearchInput = ({ value, placeholder, onChange }: IProps) => (
  <InputGroup className={filterSearch}>
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <InputGroupInput
      type="search"
      aria-label={placeholder}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  </InputGroup>
);

export default SearchInput;
