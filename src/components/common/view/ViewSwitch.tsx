import { Segmented } from "antd";

type IProps<T extends string> = {
  value: T;
  values: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
};

const ViewSwitch = <T extends string>({
  value,
  values,
  labels,
  onChange,
}: IProps<T>) => (
  <Segmented
    value={value}
    onChange={(next) => onChange(next as T)}
    options={values.map((item) => ({ label: labels[item], value: item }))}
  />
);

export default ViewSwitch;
