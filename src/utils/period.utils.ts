import dayjs from "dayjs";
import { formatDate } from "./format.utils";
import type {
  IDateRange,
  IPeriodPrintInput,
} from "../models/common/period.model";

const isoFormat = "YYYY-MM-DD";
const daysInWeek = 7;
const mondayOffset = 6;

export const rangeOfPeriod = (values: IPeriodPrintInput): IDateRange => {
  if (values.period === "custom")
    return { from: values.date_from, to: values.date_to };

  const anchor = dayjs(values.date);
  if (values.period === "daily") return { from: values.date, to: values.date };

  if (values.period === "weekly") {
    const monday = anchor.subtract((anchor.day() + mondayOffset) % daysInWeek, "day");
    return {
      from: monday.format(isoFormat),
      to: monday.add(daysInWeek - 1, "day").format(isoFormat),
    };
  }

  return {
    from: anchor.startOf("month").format(isoFormat),
    to: anchor.endOf("month").format(isoFormat),
  };
};

export const dateRangeLabel = (range: IDateRange): string =>
  range.from === range.to
    ? formatDate(range.from)
    : `${formatDate(range.from)} – ${formatDate(range.to)}`;
