import { useEffect, useId } from "react";
import {
  selectAmountDraft,
  useAmountDraftStore,
} from "../../store/common/amount.draft.store";
import { asAmountText, asNumber, sanitizeAmount } from "../../utils/field.utils";
import { formatAmountInput, toAmount } from "../../utils/format.utils";

export const useAmountDraft = (
  value: unknown,
  onChange: (next: number | null) => void,
  onBlur: () => void
) => {
  const draftKey = useId();
  const draft = useAmountDraftStore(selectAmountDraft(draftKey));
  const setDraft = useAmountDraftStore((state) => state.setDraft);
  const clearDraft = useAmountDraftStore((state) => state.clearDraft);

  useEffect(() => () => clearDraft(draftKey), [draftKey, clearDraft]);

  const handleFocus = () => setDraft(draftKey, asAmountText(value));

  const handleChange = (raw: string) => {
    const text = sanitizeAmount(raw);
    setDraft(draftKey, text);
    onChange(asNumber(text));
  };

  const handleBlur = () => {
    clearDraft(draftKey);
    onChange(toAmount(draft ?? asAmountText(value)));
    onBlur();
  };

  return {
    text: draft ?? formatAmountInput(value),
    handleFocus,
    handleChange,
    handleBlur,
  };
};
