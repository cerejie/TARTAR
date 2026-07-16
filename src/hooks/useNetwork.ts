import { useEffect } from 'react'
import { useNetworkStore } from '../stores/network.store'
import { useSyncStore } from '../stores/sync.store'

/**
 * Wires the browser's online/offline events into the network store and flushes
 * the offline write queue whenever the connection returns (build spec §2).
 * Mount once, near the app root.
 */
export function useNetwork() {
  const setOnline = useNetworkStore((s) => s.setOnline)
  const flush = useSyncStore((s) => s.flush)

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      void flush()
    }
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Attempt a flush on mount in case writes were queued in a previous session.
    if (navigator.onLine) void flush()

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [setOnline, flush])
}

/** Read-only view of connectivity + pending-sync count for the UI indicator. */
export function useSyncStatus() {
  const online = useNetworkStore((s) => s.online)
  const pending = useSyncStore((s) => s.queue.length)
  const flushing = useSyncStore((s) => s.flushing)
  return { online, pending, flushing }
}
