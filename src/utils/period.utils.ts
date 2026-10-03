import dayjs from "dayjs";
import { formatDate } from "./format.utils";
import { monthValues, quickDateValues } from "../models/common/period.model";
import type {
  IDateRange,
  IMonthYear,
  IPeriodPrintInput,
  PrintPeriod,
  QuickDate,
} from "../models/common/period.model";

const isoFormat = "YYYY-MM-DD";
const yearFormat = "YYYY";
const recentYearCount = 6;
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

  return monthYearRangeOf(values);
};

export const dateRangeLabel = (range: IDateRange): string =>
  range.from === range.to
    ? formatDate(range.from)
    : `${formatDate(range.from)} – ${formatDate(range.to)}`;

export const monthYearOf = (date: string): IMonthYear => {
  const anchor = dayjs(date);
  return { month: monthValues[anchor.month()], year: anchor.format(yearFormat) };
};

export const currentMonthYear = (): IMonthYear =>
  monthYearOf(dayjs().format(isoFormat));

export const monthYearRangeOf = ({ month, year }: IMonthYear): IDateRange => {
  const anchor = dayjs(`${year}-${month}-01`);
  return {
    from: anchor.startOf("month").format(isoFormat),
    to: anchor.endOf("month").format(isoFormat),
  };
};

export const monthYearOfRange = (range: IDateRange): IMonthYear | undefined => {
  const monthYear = monthYearOf(range.from);
  const wholeMonth = monthYearRangeOf(monthYear);
  return wholeMonth.from === range.from && wholeMonth.to === range.to
    ? monthYear
    : undefined;
};

export const recentYears = (): string[] => {
  const thisYear = dayjs().year();
  return Array.from({ length: recentYearCount }, (_, index) =>
    String(thisYear - index)
  );
};

export const yearLabelsOf = (
  years: readonly string[]
): Record<string, string> =>
  Object.fromEntries(years.map((year) => [year, year]));

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
    ...monthYearOf(today),
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
