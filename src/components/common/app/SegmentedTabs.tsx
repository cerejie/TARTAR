import { SelectionIndicator } from "react-aria-components";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  segmentedTabs,
  segmentedTabsCount,
  segmentedTabsItem,
  segmentedTabsLabel,
  segmentedTabsThumb,
} from "../../../styles/app/app.styles";

import type { Selection } from "react-aria-components";
import type { ISegmentOption } from "../../../models/common/segment.model";

type IProps<T extends string> = {
  value: T;
  options: readonly ISegmentOption<T>[];
  onChange: (value: T) => void;
  label: string;
};

const SegmentedTabs = <T extends string>({
  value,
  options,
  onChange,
  label,
}: IProps<T>) => {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const next = options.find((option) => keys.has(option.key));
    if (next) onChange(next.key);
  };

  return (
    <ToggleGroup
      spacing={0}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={handleSelectionChange}
      aria-label={label}
      className={segmentedTabs}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.key} id={option.key} className={segmentedTabsItem}>
          <SelectionIndicator className={segmentedTabsThumb} />
          <span className={segmentedTabsLabel}>{option.label}</span>
          {option.count === undefined ? null : (
            <span className={segmentedTabsCount}>{option.count}</span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SegmentedTabs;
