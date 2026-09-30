export const statDeltaPercent = (
  current: number | undefined,
  previous: number | undefined
): number | undefined => {
  if (current === undefined || previous === undefined || previous === 0)
    return undefined;

  return ((current - previous) / Math.abs(previous)) * 100;
};

export const statCaptionOf = (
  current: number | undefined,
  previous: number | undefined,
  comparison: string,
  fallback: string
): string =>
  statDeltaPercent(current, previous) === undefined ? fallback : comparison;
