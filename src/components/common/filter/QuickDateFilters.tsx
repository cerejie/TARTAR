import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  quickDateLabels,
  quickDateValues,
} from "../../../models/common/period.model";
import {
  contextSwitch,
  contextSwitchItem,
} from "../../../styles/view/view.styles";
import { quickDateOfRange, quickDateRangeOf } from "../../../utils/period.utils";

import type { Selection } from "react-aria-components";

type IProps = {
  from: string | undefined;
  to: string | undefined;
  onChange: (from: string | undefined, to: string | undefined) => void;
};

const QuickDateFilters = ({ from, to, onChange }: IProps) => {
  const selected = quickDateOfRange(from, to);

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const quickDate = quickDateValues.find((value) => keys.has(value));
    if (!quickDate) {
      onChange(undefined, undefined);
      return;
    }
    const range = quickDateRangeOf(quickDate);
    onChange(range.from, range.to);
  };

  return (
    <ToggleGroup
      variant="outline"
      spacing={2}
      selectionMode="single"
      selectedKeys={selected ? [selected] : []}
      onSelectionChange={handleSelectionChange}
      aria-label="Quick date filters"
      className={contextSwitch({ presentation: "chips" })}
    >
      {quickDateValues.map((quickDate) => (
        <ToggleGroupItem
          key={quickDate}
          id={quickDate}
          className={contextSwitchItem({ presentation: "chips" })}
        >
          {quickDateLabels[quickDate]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default QuickDateFilters;
