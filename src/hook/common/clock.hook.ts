import { useEffect } from "react";
import {
  selectNow,
  selectTick,
  useClockStore,
} from "../../store/common/clock.store";

const tickIntervalMs = 60_000;

export const useMinuteClock = () => {
  const now = useClockStore(selectNow);
  const tick = useClockStore(selectTick);

  useEffect(() => {
    tick();
    const timer = window.setInterval(tick, tickIntervalMs);
    return () => window.clearInterval(timer);
  }, [tick]);

  return now;
};
