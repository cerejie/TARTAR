import { useCallback, useEffect, useRef } from 'react'
import { App } from 'antd'
import { useQueryStore, selectEntry } from '../stores/query.store'

let mutationSeq = 0

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
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult> = {},
) {
  const keyRef = useRef<string>(`mutation:${(mutationSeq += 1)}`)
  const key = keyRef.current
  const { message } = App.useApp()
  const setEntry = useQueryStore((s) => s.setEntry)
  const invalidate = useQueryStore((s) => s.invalidate)
  const entry = useQueryStore(selectEntry<never>(key))

  // `mutate` is memoized on `key` alone so callers can pass it straight to an
  // effect or a memo. The mutation function and options therefore CANNOT be read
  // from its closure — that would freeze the values of the first render — so the
  // latest ones are kept on a ref. `mutate` only ever runs from an event handler,
  // by which time the effect below has committed the current render's values.
  const latest = useRef({ mutationFn, options })
  useEffect(() => {
    latest.current = { mutationFn, options }
  })

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      const { mutationFn, options } = latest.current
      setEntry(key, { loading: true, error: null })
      try {
        const result = await mutationFn(...args)
        setEntry(key, { loading: false, updatedAt: Date.now() })
        options.invalidate?.forEach(invalidate)

        if (result && typeof result === 'object' && 'queued' in result && result.queued) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return { mutate, loading: entry.loading, error: entry.error }
}
