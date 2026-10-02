import { SelectionIndicator } from "react-aria-components";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  contextSwitch,
  contextSwitchCount,
  contextSwitchItem,
  contextSwitchLabel,
  contextSwitchThumb,
} from "../../../styles/view/view.styles";

import type { Selection } from "react-aria-components";
import type { ISegmentOption } from "../../../models/common/segment.model";

const segmentedOptionLimit = 4;

type IProps<T extends string> = {
  value: T;
  options: readonly ISegmentOption<T>[];
  onChange: (value: T) => void;
  label: string;
};

const ContextSwitch = <T extends string>({
  value,
  options,
  onChange,
  label,
}: IProps<T>) => {
  const isSegmented = options.length <= segmentedOptionLimit;
  const presentation = isSegmented ? "segmented" : "chips";

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const next = options.find((option) => keys.has(option.key));
    if (next) onChange(next.key);
  };

  return (
    <ToggleGroup
      variant={isSegmented ? "default" : "outline"}
      spacing={isSegmented ? 0 : 2}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={handleSelectionChange}
      aria-label={label}
      className={contextSwitch({ presentation })}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.key}
          id={option.key}
          className={contextSwitchItem({ presentation })}
        >
          {isSegmented ? <SelectionIndicator className={contextSwitchThumb} /> : null}
          <span className={contextSwitchLabel}>{option.label}</span>
          {option.count === undefined ? null : (
            <span className={contextSwitchCount}>{option.count}</span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default ContextSwitch;
