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
  toolbar?: boolean;
};

const SearchInput = ({
  value,
  placeholder,
  onChange,
  toolbar = false,
}: IProps) => (
  <InputGroup
    className={filterSearch({ toolbar })}
    data-toolbar-search={toolbar || undefined}
    data-filled={(toolbar && Boolean(value)) || undefined}
  >
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
