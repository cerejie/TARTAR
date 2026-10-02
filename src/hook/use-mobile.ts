import { useIsCompact } from "./common/breakpoint.hook";

export function useIsMobile() {
  return useIsCompact();
}
