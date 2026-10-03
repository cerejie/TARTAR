import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { IMutationOptions } from "../../models/common/query.model";
import {
  selectEntry,
  useQueryStore,
} from "../../store/common/query.store";

let mutationSequence = 0;

const followUpFailedMessage =
  "Saved, but this screen could not update itself. Do not save again — reload to see the change.";

type IWriteOutcome<TResult> =
  | { saved: true; result: TResult }
  | { saved: false; description: string };

const descriptionOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isQueued = (result: unknown): boolean =>
  !!result && typeof result === "object" && "queued" in result && !!result.queued;

const settleWrite = async <TResult>(
  write: () => Promise<TResult>
): Promise<IWriteOutcome<TResult>> => {
  try {
    return { saved: true, result: await write() };
  } catch (error) {
    return { saved: false, description: descriptionOf(error) };
  }
};

export const useMutation = <TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: IMutationOptions<TResult> = {}
) => {
  const keyRef = useRef<string>(`mutation:${(mutationSequence += 1)}`);
  const key = keyRef.current;

  const setEntry = useQueryStore((state) => state.setEntry);
  const invalidate = useQueryStore((state) => state.invalidate);
  const entry = useQueryStore(selectEntry<never>(key));

  const latest = useRef({ mutationFn, options });
  useEffect(() => {
    latest.current = { mutationFn, options };
  });

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      const { mutationFn: run, options: config } = latest.current;
      setEntry(key, { loading: true, error: null });

      const outcome = await settleWrite(() => run(...args));

      if (!outcome.saved) {
        setEntry(key, { loading: false, error: outcome.description });
        toast.error(outcome.description);
        return undefined;
      }

      const { result } = outcome;
      setEntry(key, { loading: false, updatedAt: Date.now() });
      config.invalidate?.forEach(invalidate);

      if (isQueued(result)) {
        toast.info(
          config.queuedMessage ?? "Saved offline — will sync when back online"
        );
      } else if (config.successMessage) {
        toast.success(config.successMessage);
      }

      try {
        await config.onSuccess?.(result);
      } catch (error) {
        toast.warning(followUpFailedMessage, {
          description: descriptionOf(error),
        });
      }

      return result;
    },
    [key]
  );

  return { mutate, loading: entry.loading, error: entry.error };
};
