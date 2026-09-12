// In-memory fixed-window rate limiter.
//
// Scope & guarantees: Cloudflare Workers isolates are ephemeral and not
// shared, so this is a *best-effort* throttle (it stops casual brute-force
// and scripting, not a determined attacker coordinating across many IPs).
// It requires no additional bindings, which keeps the deployment simple.
// For stronger guarantees, front the Worker with a Cloudflare WAF rate-limit
// rule (documented in worker/README.md).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/**
 * Returns true when the request is allowed, false when the limit for this
 * key is exhausted within the current window.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistic prune so the map cannot grow unbounded in a long-lived isolate.
  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Client IP for rate-limit keys (falls back when behind no CF edge). */
export function clientIp(c: { req: { raw: Request } }): string {
  return c.req.raw.headers.get("cf-connecting-ip") ?? "local";
}
