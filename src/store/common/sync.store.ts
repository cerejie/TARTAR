import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncStorageKey } from "../../keys/storage.keys";
import type {
  IQueuedWrite,
  IQueuedWriteInput,
} from "../../models/common/write.model";
import type { IMutationResult } from "../../models/common/query.model";
import { executeWrite, newWriteId } from "../../utils/write.utils";

type States = {
  queue: IQueuedWrite[];
  flushing: boolean;
  lastError: string | null;
};

type Actions = {
  enqueue: (write: IQueuedWriteInput) => string;
  flush: () => Promise<void>;
  discard: (id: string) => void;
};

const initialValues: States = {
  queue: [],
  flushing: false,
  lastError: null,
};

export const useSyncStore = create<States & Actions>()(
  persist(
    (set, get) => ({
      ...initialValues,

      enqueue: (write) => {
        const id = newWriteId();
        set((state) => ({
          queue: [...state.queue, { ...write, id } as IQueuedWrite],
        }));
        return id;
      },

      flush: async () => {
        if (get().flushing) return;
        set({ flushing: true, lastError: null });

        try {
          while (get().queue.length > 0) {
            const [next, ...rest] = get().queue;

            try {
              await executeWrite(next);
              set({ queue: rest });
            } catch (error) {
              set({
                lastError:
                  error instanceof Error ? error.message : String(error),
              });
              break;
            }
          }
        } finally {
          set({ flushing: false });
        }
      },

      discard: (id) =>
        set((state) => ({
          queue: state.queue.filter((write) => write.id !== id),
        })),
    }),
    { name: syncStorageKey, partialize: (state) => ({ queue: state.queue }) }
  )
);

export const runWrite = async (
  write: IQueuedWriteInput
): Promise<IMutationResult> => {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  if (!online) {
    useSyncStore.getState().enqueue(write);
    return { queued: true };
  }

  await executeWrite({ ...write, id: newWriteId() } as IQueuedWrite);
  return { queued: false };
};
