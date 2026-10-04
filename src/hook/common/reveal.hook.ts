import { useCallback, useEffect, useId } from "react";
import { selectIsRevealed, useRevealStore } from "../../store/common/reveal.store";

export const useReveal = () => {
  const revealKey = useId();
  const revealed = useRevealStore(selectIsRevealed(revealKey));
  const setRevealed = useRevealStore((state) => state.setRevealed);

  useEffect(() => () => setRevealed(revealKey, false), [revealKey, setRevealed]);

  const toggleRevealed = useCallback(
    () => setRevealed(revealKey, !revealed),
    [revealKey, revealed, setRevealed]
  );

  return { revealed, toggleRevealed };
};
