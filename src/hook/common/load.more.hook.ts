import { useEffect, useRef } from "react";

export const useLoadMoreTrigger = (
  canLoad: boolean,
  loadedCount: number,
  onLoadMore: () => void
) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canLoad || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoad, loadedCount]);

  return sentinelRef;
};
