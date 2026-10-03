import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type IPushRequest = {
  user_ids: string[];
  title: string;
  body: string;
  url: string;
  tag: string;
};

type IPushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

const goneStatusCodes: readonly number[] = [404, 410];

const requiredEnv = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing function secret ${name}`);
  return value;
};

const isPushRequest = (value: unknown): value is IPushRequest => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.user_ids) &&
    typeof candidate.title === "string" &&
    typeof candidate.body === "string" &&
    typeof candidate.url === "string" &&
    typeof candidate.tag === "string"
  );
};

const statusCodeOf = (error: unknown): number | null => {
  if (typeof error !== "object" || error === null) return null;
  const statusCode = (error as Record<string, unknown>).statusCode;
  return typeof statusCode === "number" ? statusCode : null;
};

webpush.setVapidDetails(
  requiredEnv("VAPID_SUBJECT"),
  requiredEnv("VAPID_PUBLIC_KEY"),
  requiredEnv("VAPID_PRIVATE_KEY")
);

const supabase = createClient(
  requiredEnv("SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } }
);

const pushSecret = requiredEnv("PUSH_SECRET");

type IDelivery = {
  endpoint: string;
  outcome: "sent" | "gone" | "failed";
};

const sendTo = async (
  subscription: IPushSubscriptionRow,
  payload: string
): Promise<IDelivery> => {
  const { endpoint } = subscription;
  try {
    await webpush.sendNotification(
      {
        endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload,
      { TTL: 60 * 60 * 24 }
    );
    return { endpoint, outcome: "sent" };
  } catch (error) {
    const statusCode = statusCodeOf(error);
    const gone = statusCode !== null && goneStatusCodes.includes(statusCode);
    return { endpoint, outcome: gone ? "gone" : "failed" };
  }
};

const encoder = new TextEncoder();

const isSameSecret = (given: string | null): boolean => {
  if (given === null) return false;
  const left = encoder.encode(given);
  const right = encoder.encode(pushSecret);
  if (left.length !== right.length) return false;
  return left.reduce((diff, byte, index) => diff | (byte ^ right[index]), 0) === 0;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!isSameSecret(request.headers.get("x-push-secret"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const input: unknown = await request.json().catch(() => null);
  if (!isPushRequest(input) || input.user_ids.length === 0) {
    return new Response("Bad request", { status: 400 });
  }

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", input.user_ids);
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url,
    tag: input.tag,
  });
  const subscriptions = (data ?? []) as IPushSubscriptionRow[];
  const deliveries = await Promise.all(
    subscriptions.map((subscription) => sendTo(subscription, payload))
  );
  const countOf = (outcome: IDelivery["outcome"]): number =>
    deliveries.filter((delivery) => delivery.outcome === outcome).length;
  const goneEndpoints = deliveries
    .filter((delivery) => delivery.outcome === "gone")
    .map((delivery) => delivery.endpoint);

  if (goneEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", goneEndpoints);
  }

  return Response.json({
    sent: countOf("sent"),
    failed: countOf("failed"),
    removed: goneEndpoints.length,
  });
});
