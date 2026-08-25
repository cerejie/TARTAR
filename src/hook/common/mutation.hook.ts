import { App } from "antd";
import { useCallback, useEffect, useRef } from "react";
import type { IMutationOptions } from "../../models/common/query.model";
import {
  selectEntry,
  useQueryStore,
} from "../../store/common/query.store";

let mutationSequence = 0;

export const useMutation = <TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: IMutationOptions<TResult> = {}
) => {
  const keyRef = useRef<string>(`mutation:${(mutationSequence += 1)}`);
  const key = keyRef.current;

  const { message } = App.useApp();
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

      try {
        const result = await run(...args);
        setEntry(key, { loading: false, updatedAt: Date.now() });
        config.invalidate?.forEach(invalidate);

        const queued =
          !!result &&
          typeof result === "object" &&
          "queued" in result &&
          !!result.queued;

        if (queued) {
          message.info(
            config.queuedMessage ??
              "Saved offline — will sync when back online"
          );
        } else if (config.successMessage) {
          message.success(config.successMessage);
        }

        await config.onSuccess?.(result);
        return result;
      } catch (error) {
        const description =
          error instanceof Error ? error.message : String(error);
        setEntry(key, { loading: false, error: description });
        message.error(description);
        return undefined;
      }
    },
    [key]
  );

  return { mutate, loading: entry.loading, error: entry.error };
};
