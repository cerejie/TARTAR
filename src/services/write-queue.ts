import { supabase, toError } from './supabase'

/**
 * A single deferred write, captured in a fully serialisable form so it survives
 * a page reload in localStorage and can be replayed verbatim when the
 * connection returns (build spec §2 — offline writes are queued then flushed).
 */
export type QueuedWrite =
  | { id: string; label: string; kind: 'insert'; table: string; values: unknown }
  | { id: string; label: string; kind: 'update'; table: string; values: unknown; match: Record<string, unknown> }
  | { id: string; label: string; kind: 'delete'; table: string; match: Record<string, unknown> }
  | { id: string; label: string; kind: 'rpc'; fn: string; args: Record<string, unknown> }

/** Distributive Omit so each union member keeps its own keys (`Omit` collapses them). */
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

/** A queued write before an id is assigned (what services hand to runWrite/enqueue). */
export type QueuedWriteInput = DistributiveOmit<QueuedWrite, 'id'>

/** Replay one queued write against Supabase. Throws on error so flush can stop. */
export async function executeWrite(write: QueuedWrite): Promise<void> {
  const run = async () => {
    switch (write.kind) {
      case 'insert':
        return supabase.from(write.table).insert(write.values as never)
      // `select()` on the matched writes so we can tell "0 rows changed" apart
      // from success: PostgREST reports no error when RLS filters every row.
      case 'update':
        return supabase.from(write.table).update(write.values as never).match(write.match).select()
      case 'delete':
        return supabase.from(write.table).delete().match(write.match).select()
      case 'rpc':
        return supabase.rpc(write.fn, write.args)
    }
  }
  const { data, error } = await run()
  if (error) throw toError(error)
  if ((write.kind === 'update' || write.kind === 'delete') && Array.isArray(data) && data.length === 0) {
    throw new Error(`${write.label} changed nothing — the record is gone or you lack permission for it.`)
  }
}

let counter = 0
/** Stable-ish id for a queued write (time + counter avoids collisions in a burst). */
export function newWriteId(): string {
  counter += 1
  return `${Date.now().toString(36)}-${counter.toString(36)}`
}
