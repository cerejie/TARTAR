import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { filterSearch } from "../../../styles/filter/filter.css";

type IProps = {
  value: string | undefined;
  placeholder: string;
  onChange: (value: string | undefined) => void;
};

const SearchInput = ({ value, placeholder, onChange }: IProps) => (
  <Input
    size="middle"
    className={`${filterSearch}`}
    placeholder={placeholder}
    prefix={<SearchOutlined />}
    allowClear
    value={value}
    onChange={(event) => onChange(event.target.value || undefined)}
  />
);

export default SearchInput;
