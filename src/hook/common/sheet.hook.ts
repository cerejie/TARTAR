import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useCloseOnNavigate = (open: boolean, onClose: () => void) => {
  const { pathname } = useLocation();
  const openedAt = useRef(pathname);

  useEffect(() => {
    if (open) openedAt.current = pathname;
  }, [open]);

  useEffect(() => {
    if (open && openedAt.current !== pathname) onClose();
  }, [pathname]);
};
