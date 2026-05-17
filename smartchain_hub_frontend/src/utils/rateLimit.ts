/**
 * In-memory IP rate limiter for Next.js API routes.
 *
 * Each serverless container maintains its own store, giving per-container
 * protection — a practical first layer of defense. For distributed rate
 * limiting across many containers, back this with Upstash Redis.
 *
 * Usage:
 *   const ip = getClientIp(req);
 *   if (!rateLimit(`route:${ip}`, 5, 60_000)) {
 *     return res.status(429).json({ error: "Too many requests" });
 *   }
 */
import type { NextApiRequest } from "next";

interface Entry {
  count:   number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune stale entries every 5 minutes so the Map doesn't grow unboundedly
// between warm invocations.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Returns true if the request is allowed, false if it should be blocked.
 *
 * @param key       Unique per-client string — e.g. `"stripe:<ip>"`
 * @param max       Maximum allowed requests within the window
 * @param windowMs  Rolling window length in milliseconds
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

/**
 * Extract the real client IP from a Next.js request, honouring
 * X-Forwarded-For as set by Vercel / Cloudflare.
 */
export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}
