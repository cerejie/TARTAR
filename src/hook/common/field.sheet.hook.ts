import {
  selectIsSheetOpen,
  selectSheetDraft,
  useFieldSheetStore,
} from "../../store/common/field.sheet.store";

export const useFieldSheet = (sheetId: string) => {
  const open = useFieldSheetStore(selectIsSheetOpen(sheetId));
  const draft = useFieldSheetStore(selectSheetDraft(sheetId));
  const openSheetAt = useFieldSheetStore((state) => state.openSheet);
  const setDraft = useFieldSheetStore((state) => state.setDraft);
  const closeSheet = useFieldSheetStore((state) => state.closeSheet);

  return {
    open,
    draft,
    setDraft,
    closeSheet,
    openSheet: (initialDraft: string) => openSheetAt(sheetId, initialDraft),
  };
};
