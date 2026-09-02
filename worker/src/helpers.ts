// Shared helpers for the KidMin Harmony API.

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
  SEED_DEMO?: string;
}

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const error = (message: string, status = 400): Response =>
  json({ error: message }, status);

export const notFound = (message = "Not found"): Response => error(message, 404);

export function id(): string {
  return crypto.randomUUID();
}

/**
 * Build CORS response headers. When ALLOWED_ORIGINS is empty or unset, the
 * Worker is assumed to be behind Vercel rewrites (same-origin) so we echo
 * back the request Origin header for flexibility while still being explicit.
 * When a comma-separated allow-list is configured we honour it.
 */
export function corsHeaders(allowedOrigins: string | undefined, requestOrigin?: string | null): Record<string, string> {
  let origin = "*";
  if (allowedOrigins && allowedOrigins.trim()) {
    const list = allowedOrigins.split(",").map((s) => s.trim());
    if (requestOrigin && list.includes(requestOrigin)) {
      origin = requestOrigin;
    } else if (list.length > 0) {
      origin = list[0];
    }
  } else if (requestOrigin) {
    // No explicit allow-list — behind a proxy, echo the request origin.
    origin = requestOrigin;
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// -------- Audit logging --------

export async function auditLog(
  db: D1Database,
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  metadata?: string,
): Promise<void> {
  try {
    await db.prepare(
      "INSERT INTO audit_logs (id, user_id, action, resource, resource_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
    ).bind(id(), userId, action, resource, resourceId, metadata ?? null).run();
  } catch {
    // Non-fatal: don't break the main request if audit logging fails.
    console.error("audit log insert failed");
  }
}

// -------- Simple in-memory rate limiter (per-Worker isolate) --------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request should be blocked.
 * windowSec: time window in seconds
 * maxRequests: maximum requests allowed in the window
 */
export function rateLimit(key: string, maxRequests: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}
