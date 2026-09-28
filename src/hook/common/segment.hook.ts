import { useMemo } from "react";
import { selectSegment, useSegmentStore } from "../../store/common/segment.store";

export const useSegment = <T extends string>(
  key: string,
  values: readonly [T, ...T[]]
) => {
  const stored = useSegmentStore(selectSegment(key));
  const setSegmentAt = useSegmentStore((state) => state.setSegment);

  const segment = values.find((value) => value === stored) ?? values[0];

  return useMemo(
    () => ({
      segment,
      setSegment: (next: T) => setSegmentAt(key, next),
    }),
    [segment, key, setSegmentAt]
  );
};
