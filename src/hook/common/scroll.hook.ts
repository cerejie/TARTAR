import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  selectIsScrolledPast,
  selectScrollPosition,
  useScrollStore,
} from "../../store/common/scroll.store";

import type { UIEvent } from "react";

export const useScrollRestore = () => {
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLElement>(null);
  const setPosition = useScrollStore((state) => state.setPosition);

  useLayoutEffect(() => {
    const top = selectScrollPosition(pathname)(useScrollStore.getState());
    scrollRef.current?.scrollTo({ top });
  }, [pathname]);

  const handleScroll = (event: UIEvent<HTMLElement>) =>
    setPosition(pathname, event.currentTarget.scrollTop);

  return { pathname, scrollRef, handleScroll };
};

export const useScrolledPast = (top: number) => {
  const { pathname } = useLocation();

  return useScrollStore(selectIsScrolledPast(pathname, top));
};
