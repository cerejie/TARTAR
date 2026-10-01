import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncFlushLockKey, syncStorageKey } from "../../keys/storage.keys";
import { useAccountStore } from "../data/account/account.store";
import type {
  IFailedWrite,
  IFlushResult,
  IQueuedWrite,
  IQueuedWriteInput,
} from "../../models/common/write.model";
import type { IMutationResult } from "../../models/common/query.model";
import {
  executeWrite,
  failureKindOf,
  isOwnWrite,
  messageOf,
  prepareWrite,
} from "../../utils/write.utils";

type States = {
  queue: IQueuedWrite[];
  failed: IFailedWrite[];
  flushing: boolean;
};

type Actions = {
  enqueue: (write: IQueuedWrite) => void;
  flush: () => Promise<IFlushResult>;
  retry: (id: string) => void;
  discard: (id: string) => void;
};

type IPersistedSync = Pick<States, "queue" | "failed">;

const initialValues: States = {
  queue: [],
  failed: [],
  flushing: false,
};

const noChanges: IFlushResult = { synced: 0, failed: 0 };

export const selectSessionOwner = (
  state: ReturnType<typeof useAccountStore.getState>
): string | null => state.user?.id ?? state.developerEmail;

const currentOwner = (): string | null =>
  selectSessionOwner(useAccountStore.getState());

const isPersistedSync = (value: unknown): value is IPersistedSync =>
  typeof value === "object" &&
  value !== null &&
  "queue" in value &&
  "failed" in value &&
  Array.isArray(value.queue) &&
  Array.isArray(value.failed);

const persistedSync = (fallback: IPersistedSync): IPersistedSync => {
  try {
    const raw = localStorage.getItem(syncStorageKey);
    const stored: unknown = raw ? JSON.parse(raw) : null;
    const state =
      typeof stored === "object" && stored !== null && "state" in stored
        ? stored.state
        : null;
    if (!isPersistedSync(state)) return fallback;
    return { queue: state.queue, failed: state.failed };
  } catch {
    return fallback;
  }
};

const withoutWrite = (queue: IQueuedWrite[], id: string): IQueuedWrite[] =>
  queue.filter((write) => write.id !== id);

const withoutFailed = (failed: IFailedWrite[], id: string): IFailedWrite[] =>
  failed.filter((item) => item.write.id !== id);

const withFlushLock = async (
  drain: () => Promise<IFlushResult>
): Promise<IFlushResult> => {
  if (typeof navigator === "undefined" || !("locks" in navigator)) {
    return drain();
  }
  return navigator.locks.request(
    syncFlushLockKey,
    { ifAvailable: true },
    async (lock) => (lock ? drain() : noChanges)
  );
};

export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => {
      const drain = async (owner: string): Promise<IFlushResult> => {
        const result = { ...noChanges };

        for (;;) {
          const next = persistedSync(get()).queue.find((write) =>
            isOwnWrite(write, owner)
          );
          if (!next) break;

          try {
            await executeWrite(next);
            result.synced += 1;
            set((state) => {
              const saved = persistedSync(state);
              return {
                queue: withoutWrite(saved.queue, next.id),
                failed: saved.failed,
              };
            });
          } catch (error) {
            if (failureKindOf(error) !== "refused") break;

            result.failed += 1;
            set((state) => {
              const saved = persistedSync(state);
              return {
                queue: withoutWrite(saved.queue, next.id),
                failed: [
                  ...withoutFailed(saved.failed, next.id),
                  { write: next, reason: messageOf(error), failedAt: Date.now() },
                ],
              };
            });
          }
        }

        return result;
      };

      return {
        ...initialValues,

        enqueue: (write) =>
          set((state) => {
            const saved = persistedSync(state);
            return {
              queue: [...withoutWrite(saved.queue, write.id), write],
              failed: saved.failed,
            };
          }),

        flush: async () => {
          const owner = currentOwner();
          if (get().flushing || !owner) return noChanges;
          set({ flushing: true });

          try {
            return await withFlushLock(() => drain(owner));
          } finally {
            set({ flushing: false });
          }
        },

        retry: (id) =>
          set((state) => {
            const saved = persistedSync(state);
            const item = saved.failed.find((failed) => failed.write.id === id);
            if (!item) return saved;
            return {
              failed: withoutFailed(saved.failed, id),
              queue: [...withoutWrite(saved.queue, id), item.write],
            };
          }),

        discard: (id) =>
          set((state) => {
            const saved = persistedSync(state);
            return {
              queue: withoutWrite(saved.queue, id),
              failed: withoutFailed(saved.failed, id),
            };
          }),
      };
    },
    {
      name: syncStorageKey,
      partialize: (state) => ({ queue: state.queue, failed: state.failed }),
    }
  )
);

export const rehydrateSync = (): void => {
  void useSyncStore.persist.rehydrate();
};

export const runWrite = async (
  input: IQueuedWriteInput
): Promise<IMutationResult> => {
  const write = prepareWrite(input, currentOwner());
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  if (!online) {
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  }

  try {
    await executeWrite(write);
    return { queued: false };
  } catch (error) {
    if (failureKindOf(error) !== "network") throw error;
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  }
};
