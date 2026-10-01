import { useRef } from "react";
import {
  selectPullDistance,
  selectPullRefreshing,
  usePullStore,
} from "../../store/common/pull.store";
import { useQueryStore } from "../../store/common/query.store";

import type { TouchEvent } from "react";

const pullReadyDistance = 64;
const pullMaxDistance = 96;
const pullResistance = 0.5;
const pullRefreshingHeight = 52;

export const usePullToRefresh = () => {
  const startY = useRef<number | null>(null);
  const setDistance = usePullStore((state) => state.setDistance);
  const setRefreshing = usePullStore((state) => state.setRefreshing);
  const refetchWatched = useQueryStore((state) => state.refetchWatched);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const atTop = event.currentTarget.scrollTop <= 0;
    if (!atTop || usePullStore.getState().refreshing) return;
    startY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (startY.current === null) return;
    const pulled = (event.touches[0]?.clientY ?? startY.current) - startY.current;
    setDistance(Math.min(Math.max(0, pulled * pullResistance), pullMaxDistance));
  };

  const handleTouchEnd = () => {
    if (startY.current === null) return;
    startY.current = null;
    const ready = usePullStore.getState().distance >= pullReadyDistance;
    setDistance(0);
    if (!ready) return;

    setRefreshing(true);
    void refetchWatched().finally(() => setRefreshing(false));
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };
};

export const usePullIndicator = () => {
  const distance = usePullStore(selectPullDistance);
  const refreshing = usePullStore(selectPullRefreshing);

  return {
    height: refreshing ? pullRefreshingHeight : distance,
    rotation: (distance / pullReadyDistance) * 360,
    ready: distance >= pullReadyDistance,
    refreshing,
    visible: refreshing || distance > 0,
  };
};
