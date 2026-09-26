import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { viewSwitchItem } from "../../../styles/view/view.styles";

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
}: IProps<T>) => {
  const selectView = (key: unknown) => {
    const next = values.find((item) => item === key);
    if (next) onChange(next);
  };

  return (
    <ToggleGroup
      variant="outline"
      spacing={2}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => selectView([...keys][0])}
      aria-label="View"
    >
      {values.map((item) => (
        <ToggleGroupItem key={item} id={item} className={viewSwitchItem}>
          {labels[item]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default ViewSwitch;
