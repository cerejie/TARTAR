import { useCallback, useRef } from 'react'
import { App } from 'antd'
import { useQueryStore, selectEntry } from '../stores/query.store'

let mutationSeq = 0

/** A write result that may have been deferred to the offline sync queue. */
type MaybeQueued = { queued?: boolean } | void | undefined

interface MutationOptions<TResult> {
  /** Query keys (or prefixes) to invalidate on success so lists refetch. */
  invalidate?: string[]
  successMessage?: string
  /** Shown instead of successMessage when the write was queued offline. */
  queuedMessage?: string
  onSuccess?: (result: TResult) => void | Promise<void>
}

/**
 * Runs an async write with loading/error tracked in the Zustand query cache
 * (no useState). On success it invalidates the given keys and shows an antd
 * message; if the service reports the write was queued offline, it shows the
 * queued notice instead (build spec §2).
 */
export function useMutation<TArgs extends unknown[], TResult extends MaybeQueued>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult> = {},
) {
  const keyRef = useRef<string>(`mutation:${(mutationSeq += 1)}`)
  const key = keyRef.current
  const { message } = App.useApp()
  const setEntry = useQueryStore((s) => s.setEntry)
  const invalidate = useQueryStore((s) => s.invalidate)
  const entry = useQueryStore(selectEntry<never>(key))

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setEntry(key, { loading: true, error: null })
      try {
        const result = await mutationFn(...args)
        setEntry(key, { loading: false, updatedAt: Date.now() })
        options.invalidate?.forEach(invalidate)

        if (result && typeof result === 'object' && result.queued) {
          message.info(options.queuedMessage ?? 'Saved offline — will sync when back online')
        } else if (options.successMessage) {
          message.success(options.successMessage)
        }
        await options.onSuccess?.(result)
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setEntry(key, { loading: false, error: msg })
        message.error(msg)
        return undefined
      }
    },
    // Stable across renders; options/mutationFn are read fresh via closure each call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return { mutate, loading: entry.loading, error: entry.error }
}
