import ViewSwitch from "../view/ViewSwitch";

const allKey = "all";

type IProps<T extends string> = {
  value: T | undefined;
  values: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | undefined) => void;
  label?: string;
};

const StatusFilterTabs = <T extends string>({
  value,
  values,
  labels,
  onChange,
  label = "Status",
}: IProps<T>) => {
  const tabValues: readonly (T | typeof allKey)[] = [allKey, ...values];
  const tabLabels: Record<T | typeof allKey, string> = {
    ...labels,
    [allKey]: "All",
  };

  const selectTab = (next: T | typeof allKey) =>
    onChange(next === allKey ? undefined : values.find((item) => item === next));

  return (
    <ViewSwitch
      value={value ?? allKey}
      values={tabValues}
      labels={tabLabels}
      onChange={selectTab}
      label={label}
    />
  );
};

export default StatusFilterTabs;
