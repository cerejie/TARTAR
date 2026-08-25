import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local."
  );
}

let customToken: string | null = null;

export const setCustomToken = (token: string | null): void => {
  customToken = token;
};

const customFetch: typeof fetch = (input, init) => {
  if (!customToken) return fetch(input, init);

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${customToken}`);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: { fetch: customFetch },
});

const constraintMessages: Record<string, string> = {
  "23503":
    "This record is still used by other records, so it cannot be deleted.",
  "23505": "A record with these details already exists.",
};

export const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;

  if (error && typeof error === "object" && "message" in error) {
    const code =
      "code" in error ? String((error as { code: unknown }).code) : "";
    return new Error(
      constraintMessages[code] ??
        String((error as { message: unknown }).message)
    );
  }

  return new Error("Unexpected error");
};
