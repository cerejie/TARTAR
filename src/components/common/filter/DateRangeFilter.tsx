import { parseDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeCalendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  filterDatePlaceholder,
  filterDatePopover,
  filterDateTrigger,
} from "../../../styles/filter/filter.styles";
import { formatDate } from "../../../utils/format.utils";

type IProps = {
  from: string | undefined;
  to: string | undefined;
  onChange: (from: string | undefined, to: string | undefined) => void;
};

const DateRangeFilter = ({ from, to, onChange }: IProps) => {
  const range = from && to ? { start: parseDate(from), end: parseDate(to) } : null;

  return (
    <PopoverTrigger>
      <Button variant="outline" className={filterDateTrigger}>
        <CalendarIcon />
        {range ? (
          `${formatDate(from)} – ${formatDate(to)}`
        ) : (
          <span className={filterDatePlaceholder}>Any date</span>
        )}
      </Button>
      <Popover placement="bottom start" className={filterDatePopover}>
        <RangeCalendar
          value={range}
          onChange={(next) =>
            onChange(next?.start.toString(), next?.end.toString())
          }
        />
      </Popover>
    </PopoverTrigger>
  );
};

export default DateRangeFilter;
