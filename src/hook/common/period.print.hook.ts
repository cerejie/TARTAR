import {
  monthLabels,
  monthValues,
  periodPrintSchema,
  printPeriodLabels,
  printPeriodValues,
} from "../../models/common/period.model";
import { todayIso } from "../../utils/format.utils";
import { toOptions } from "../../utils/option.utils";
import {
  currentMonthYear,
  rangeOfPeriod,
  recentYears,
  yearLabelsOf,
} from "../../utils/period.utils";
import { useModal } from "./modal.hook";
import { useMutation } from "./mutation.hook";
import type { DefaultValues } from "react-hook-form";
import type { IFieldConfig } from "../../models/common/field.model";
import type {
  IDateRange,
  IPeriodPrintInput,
} from "../../models/common/period.model";

const isCustom = (values: IPeriodPrintInput) => values.period === "custom";
const isMonthly = (values: IPeriodPrintInput) => values.period === "monthly";
const isDated = (values: IPeriodPrintInput) =>
  !isCustom(values) && !isMonthly(values);

const periodPrintFieldsOf = (
  years: readonly string[]
): IFieldConfig<IPeriodPrintInput>[] => [
  {
    name: "period",
    label: "Period",
    type: "select",
    required: true,
    allowClear: false,
    options: toOptions(printPeriodValues, printPeriodLabels),
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
    hint: "Weekly prints Monday to Sunday of this date.",
    hidden: (values) => !isDated(values),
  },
  {
    name: "month",
    label: "Month",
    type: "select",
    span: "half",
    required: true,
    allowClear: false,
    options: toOptions(monthValues, monthLabels),
    hidden: (values) => !isMonthly(values),
  },
  {
    name: "year",
    label: "Year",
    type: "select",
    span: "half",
    required: true,
    allowClear: false,
    options: toOptions(years, yearLabelsOf(years)),
    hidden: (values) => !isMonthly(values),
  },
  {
    name: "date_from",
    label: "From",
    type: "date",
    span: "half",
    required: true,
    hidden: (values) => !isCustom(values),
  },
  {
    name: "date_to",
    label: "To",
    type: "date",
    span: "half",
    required: true,
    hidden: (values) => !isCustom(values),
  },
];

const periodPrintDefaultsOf = (): DefaultValues<IPeriodPrintInput> => ({
  period: "monthly",
  date: todayIso(),
  ...currentMonthYear(),
  date_from: todayIso(),
  date_to: todayIso(),
});

export const usePeriodPrint = (
  modalKey: string,
  onPrint: (range: IDateRange) => Promise<void>
) => {
  const { modal, closeModal } = useModal(modalKey);

  const printMutation = useMutation(
    (values: IPeriodPrintInput) => onPrint(rangeOfPeriod(values)),
    { onSuccess: closeModal }
  );

  return {
    open: modal.visible,
    closeModal,
    periodPrintSchema,
    periodPrintFields: periodPrintFieldsOf(recentYears()),
    periodPrintDefaults: periodPrintDefaultsOf(),
    submitting: printMutation.loading,
    submitPrint: (values: IPeriodPrintInput) => {
      void printMutation.mutate(values);
    },
  };
};
