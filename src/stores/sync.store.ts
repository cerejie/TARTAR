import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  executeWrite,
  newWriteId,
  type QueuedWrite,
  type QueuedWriteInput,
} from '../services/write-queue'

/**
 * Offline write queue (build spec §2). Writes made while offline are appended
 * here (persisted to localStorage so they survive a reload) and flushed FIFO
 * when the connection returns. The pending count is surfaced in the UI.
 */
interface SyncState {
  queue: QueuedWrite[]
  flushing: boolean
  lastError: string | null
  /** Append a write to the queue; returns the generated id. */
  enqueue: (write: QueuedWriteInput) => string
  /** Replay queued writes in order; stops at the first failure. */
  flush: () => Promise<void>
  /** Drop a queued write (e.g. user abandons it). */
  discard: (id: string) => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      flushing: false,
      lastError: null,

      enqueue: (write) => {
        const id = newWriteId()
        set((s) => ({ queue: [...s.queue, { ...write, id } as QueuedWrite] }))
        return id
      },

      flush: async () => {
        if (get().flushing) return
        set({ flushing: true, lastError: null })
        try {
          // Re-read the queue each iteration so items added mid-flush are caught.
          while (get().queue.length > 0) {
            const [next, ...rest] = get().queue
            try {
              await executeWrite(next)
              set({ queue: rest })
            } catch (err) {
              set({ lastError: err instanceof Error ? err.message : String(err) })
              break // leave `next` at the head to retry on the next flush
            }
          }
        } finally {
          set({ flushing: false })
        }
      },

      discard: (id) => set((s) => ({ queue: s.queue.filter((w) => w.id !== id) })),
    }),
    { name: 'tartar-sync-queue', partialize: (s) => ({ queue: s.queue }) },
  ),
)

/**
 * Offline-aware write helper used by every domain service. When online it runs
 * the write immediately; when offline it queues the write and returns without
 * throwing so the caller can optimistically update local state.
 *
 * @returns `queued: true` if it was deferred for later sync.
 */
export async function runWrite(
  write: QueuedWriteInput,
): Promise<{ queued: boolean }> {
  const online = typeof navigator === 'undefined' ? true : navigator.onLine
  if (!online) {
    useSyncStore.getState().enqueue(write)
    return { queued: true }
  }
  await executeWrite({ ...write, id: newWriteId() } as QueuedWrite)
  return { queued: false }
}
