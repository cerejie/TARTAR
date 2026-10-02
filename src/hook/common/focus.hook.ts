import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { rowFocusParamKey } from "../../keys/table.keys";

const focusedRowSelector = "[data-focused-row]";

export const focusedRowProps = { "data-focused-row": "" };

export const useRowFocus = (keys: readonly string[]) => {
  const [params] = useSearchParams();
  const focusedKey = params.get(rowFocusParamKey);
  const focusedPresent = !!focusedKey && keys.includes(focusedKey);

  useEffect(() => {
    if (!focusedPresent) return;
    document
      .querySelector(focusedRowSelector)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusedPresent, focusedKey]);

  return (key: string) => focusedPresent && key === focusedKey;
};
