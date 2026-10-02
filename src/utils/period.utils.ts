import dayjs from "dayjs";
import { formatDate } from "./format.utils";
import { quickDateValues } from "../models/common/period.model";
import type {
  IDateRange,
  IPeriodPrintInput,
  PrintPeriod,
  QuickDate,
} from "../models/common/period.model";

const isoFormat = "YYYY-MM-DD";
const monthFormat = "YYYY-MM";
const monthLabelFormat = "MMMM YYYY";
const recentMonthCount = 12;
const daysInWeek = 7;
const mondayOffset = 6;

const quickDatePeriods: Record<QuickDate, Exclude<PrintPeriod, "custom">> = {
  today: "daily",
  week: "weekly",
  month: "monthly",
};

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

export const currentMonth = (): string => dayjs().format(monthFormat);

export const monthRangeOf = (month: string): IDateRange => {
  const anchor = dayjs(`${month}-01`);
  return {
    from: anchor.startOf("month").format(isoFormat),
    to: anchor.endOf("month").format(isoFormat),
  };
};

export const recentMonths = (): string[] =>
  Array.from({ length: recentMonthCount }, (_, index) =>
    dayjs().subtract(index, "month").format(monthFormat)
  );

export const monthLabelsOf = (
  months: readonly string[]
): Record<string, string> =>
  Object.fromEntries(
    months.map((month) => [month, dayjs(`${month}-01`).format(monthLabelFormat)])
  );

export const monthOfRange = (range: IDateRange): string | undefined => {
  const month = dayjs(range.from).format(monthFormat);
  const wholeMonth = monthRangeOf(month);
  return wholeMonth.from === range.from && wholeMonth.to === range.to
    ? month
    : undefined;
};

export const monthToDateRange = (monthsAgo: number): IDateRange => {
  const anchor = dayjs().subtract(monthsAgo, "month");
  return {
    from: anchor.startOf("month").format(isoFormat),
    to: anchor.format(isoFormat),
  };
};

export const quickDateRangeOf = (quickDate: QuickDate): IDateRange => {
  const today = dayjs().format(isoFormat);
  return rangeOfPeriod({
    period: quickDatePeriods[quickDate],
    date: today,
    date_from: today,
    date_to: today,
  });
};

export const quickDateOfRange = (
  from: string | undefined,
  to: string | undefined
): QuickDate | undefined =>
  quickDateValues.find((quickDate) => {
    const range = quickDateRangeOf(quickDate);
    return range.from === from && range.to === to;
  });
