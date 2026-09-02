import { useEffect, useMemo } from "react";
import {
  selectExpandedRow,
  useExpansionStore,
} from "../../store/common/expansion.store";

export const rowExpansionPersistProps = { "data-row-expansion-persist": "" };

const rowExpansionPersistSelector = "[data-row-expansion-persist]";

export const useRowExpansion = (key: string) => {
  const expandedRow = useExpansionStore(selectExpandedRow(key));
  const setExpandedRowAt = useExpansionStore((state) => state.setExpandedRow);

  useEffect(() => {
    if (!expandedRow) return;

    const collapseOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(rowExpansionPersistSelector)
      ) {
        return;
      }
      setExpandedRowAt(key, null);
    };

    document.addEventListener("pointerdown", collapseOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", collapseOnOutsidePointer);
  }, [expandedRow, key, setExpandedRowAt]);

  return useMemo(
    () => ({
      expandedRow,
      toggleRow: (rowKey: string) =>
        setExpandedRowAt(key, expandedRow === rowKey ? null : rowKey),
    }),
    [expandedRow, key, setExpandedRowAt]
  );
};
