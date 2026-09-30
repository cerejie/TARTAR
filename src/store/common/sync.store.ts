import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
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

export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => ({
      ...initialValues,

      enqueue: (write) =>
        set((state) => ({ queue: [...state.queue, write] })),

      flush: async () => {
        const owner = currentOwner();
        if (get().flushing || !owner) return noChanges;
        set({ flushing: true });

        const result = { ...noChanges };

        try {
          for (;;) {
            const next = get().queue.find((write) => isOwnWrite(write, owner));
            if (!next) break;

            try {
              await executeWrite(next);
              result.synced += 1;
              set((state) => ({
                queue: state.queue.filter((write) => write.id !== next.id),
              }));
            } catch (error) {
              if (failureKindOf(error) !== "refused") break;

              result.failed += 1;
              set((state) => ({
                queue: state.queue.filter((write) => write.id !== next.id),
                failed: [
                  ...state.failed,
                  { write: next, reason: messageOf(error), failedAt: Date.now() },
                ],
              }));
            }
          }
        } finally {
          set({ flushing: false });
        }

        return result;
      },

      retry: (id) =>
        set((state) => {
          const item = state.failed.find((failed) => failed.write.id === id);
          if (!item) return state;
          return {
            failed: state.failed.filter((failed) => failed.write.id !== id),
            queue: [...state.queue, item.write],
          };
        }),

      discard: (id) =>
        set((state) => ({
          queue: state.queue.filter((write) => write.id !== id),
          failed: state.failed.filter((failed) => failed.write.id !== id),
        })),
    }),
    {
      name: syncStorageKey,
      partialize: (state) => ({ queue: state.queue, failed: state.failed }),
    }
  )
);

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
