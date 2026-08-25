import type { IFieldOption } from "../models/common/field.model";

export const toOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>
): IFieldOption[] =>
  values.map((value) => ({ value, label: labels[value] }));

export const toRecordOptions = <T extends { name: string }>(
  records: readonly T[],
  valueOf: (record: T) => string
): IFieldOption[] =>
  records.map((record) => ({ value: valueOf(record), label: record.name }));
