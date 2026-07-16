import { createClient } from '@supabase/supabase-js'

/**
 * The single Supabase client for the whole app.
 *
 * Auth is non-standard (build spec §4): the superAdmin is a real Supabase Auth
 * session, but every other user authenticates through the custom `public.login`
 * RPC, which returns a JWT signed with the project secret. We inject that custom
 * token via a `fetch` wrapper so PostgREST + RLS treat the custom user exactly
 * like a native session — without disturbing the superAdmin's own Auth session.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  )
}

// Module-level custom token. When set (custom user logged in) it overrides the
// Authorization header on every request. Null for the superAdmin / anon.
let customToken: string | null = null

/** Set/clear the custom-user bearer token used for all subsequent requests. */
export function setCustomToken(token: string | null): void {
  customToken = token
}

const customFetch: typeof fetch = (input, init) => {
  if (!customToken) return fetch(input, init)
  // Copy existing headers (keeps supabase's `apikey`) then force our bearer.
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${customToken}`)
  return fetch(input, { ...init, headers })
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The custom-user token is our own JWT — supabase-js must not try to refresh
    // it. Only the superAdmin uses the built-in Auth flow.
    detectSessionInUrl: false,
  },
  global: { fetch: customFetch },
})

/** Normalise a Supabase/PostgREST error into a plain Error with a clean message. */
export function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message))
  }
  return new Error('Unexpected error')
}
