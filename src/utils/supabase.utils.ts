import { createClient } from "@supabase/supabase-js";
import { plainServerMessage } from "./error.utils";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local."
  );
}

let customToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

const unauthorizedStatus = 401;
const networkStatus = 0;
const authEndpoint = "/auth/v1/";

export const setCustomToken = (token: string | null): void => {
  customToken = token;
  void supabase.realtime.setAuth(token);
};

export const onSessionExpired = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler;
};

const requestUrlOf = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

const withAuthorization = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (!customToken) return fetch(input, init);

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${customToken}`);
  return fetch(input, { ...init, headers });
};

const customFetch: typeof fetch = async (input, init) => {
  const response = await withAuthorization(input, init);
  const isExpired =
    response.status === unauthorizedStatus &&
    !requestUrlOf(input).includes(authEndpoint);
  if (isExpired) sessionExpiredHandler?.();
  return response;
};

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: { fetch: customFetch },
});

export const toError = (error: unknown): Error => {
  if (error && typeof error === "object" && "message" in error) {
    const code = "code" in error ? String(error.code) : "";
    const message = String(error.message);
    const plainMessage = plainServerMessage(code, message);

    if (plainMessage) return new Error(plainMessage, { cause: error });
    if (error instanceof Error) return error;
    return new Error(message);
  }

  return new Error("Unexpected error");
};

const needsInternetMessage =
  "This needs an internet connection. Try again once you are back online.";

export const assertOnline = (): void => {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  if (offline) throw new Error(needsInternetMessage);
};

export const onlineOnly = async <TResult extends { status: number }>(
  request: PromiseLike<TResult>
): Promise<TResult> => {
  assertOnline();

  const result = await request;
  if (result.status === networkStatus) throw new Error(needsInternetMessage);

  return result;
};
