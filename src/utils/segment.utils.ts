import type { ISegmentOption } from "../models/common/segment.model";

export const allSegmentKey = "all";

export type IAllSegmentKey = typeof allSegmentKey;

export const segmentOptionsOf = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>
): ISegmentOption<T>[] => values.map((key) => ({ key, label: labels[key] }));

export const statusSegmentOptionsOf = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>
): ISegmentOption<T | IAllSegmentKey>[] => [
  { key: allSegmentKey, label: "All" },
  ...segmentOptionsOf(values, labels),
];

export const statusOfSegment = <T extends string>(
  key: T | IAllSegmentKey,
  values: readonly T[]
): T | undefined => values.find((value) => value === key);
