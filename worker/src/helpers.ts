// Shared helpers for the KidMin Harmony API.

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  JWT_SECRET: string;
  /**
   * Comma-separated list of origins allowed to call this API cross-origin
   * (e.g. "https://app.example.com,https://staging.example.com"). When unset
   * NO cross-origin requests are allowed — which is the correct default when
   * the Vercel frontend proxies /api through its own origin. A single `*`
   * entry explicitly allows any origin.
   */
  ALLOWED_ORIGINS?: string;
  /**
   * Optional IANA timezone (e.g. "Africa/Lagos") used to determine "today"
   * for attendance and event status. Defaults to UTC.
   */
  APP_TIMEZONE?: string;
  /** Only true for local development / demo. Never enable in production. */
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

export const tooManyRequests = (message = "Too many requests, please slow down", retryAfterSec = 60): Response =>
  new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfterSec) },
  });

export function id(): string {
  return crypto.randomUUID();
}

// ------------------- CORS -------------------

/**
 * Build CORS headers for a request, honoring the ALLOWED_ORIGINS allowlist.
 * Returns an empty object when the request has no Origin header (same-origin
 * or non-browser caller) or when the origin is not allowed — in that case the
 * browser blocks the cross-origin read, which is the safe default.
 */
export function corsHeaders(allowedOrigins: string | undefined, origin: string | null): Record<string, string> {
  if (!origin) return {};

  const list = (allowedOrigins ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let allowed = false;
  if (list.length === 0) {
    allowed = false; // no allowlist configured → deny cross-origin
  } else if (list.includes("*")) {
    allowed = true;
  } else {
    allowed = list.includes(origin);
  }

  if (!allowed) return {};

  return {
    "Access-Control-Allow-Origin": list.includes("*") ? "*" : origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    ...(list.includes("*") ? {} : { Vary: "Origin" }),
  };
}

// ------------------- Security headers -------------------

export function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  };
}

// ------------------- Dates -------------------

/**
 * Calendar date (YYYY-MM-DD) for the given instant in the given IANA
 * timezone. Falls back to UTC when no zone is given or the zone is invalid.
 */
export function dateInTimezone(date: Date, timeZone?: string): string {
  if (timeZone) {
    try {
      // en-CA formats as YYYY-MM-DD.
      return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch {
      // Invalid IANA zone — fall through to UTC.
    }
  }
  return date.toISOString().slice(0, 10);
}

/** "Today" (YYYY-MM-DD) using the Worker's configured APP_TIMEZONE (UTC default). */
export function todayISO(timeZone?: string): string {
  return dateInTimezone(new Date(), timeZone);
}

// ------------------- Validation helpers -------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidEmail(v: string): boolean {
  return v.length <= 254 && EMAIL_RE.test(v);
}

/** Strict calendar-date check (YYYY-MM-DD, real calendar date, not in the future). */
export function isValidDate(v: string, allowFuture = false): boolean {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return false;
  if (!allowFuture && v > dateInTimezone(new Date())) return false;
  return true;
}

export function clampLen(v: string | null, max: number): string | null {
  if (v === null) return null;
  return v.length > max ? v.slice(0, max) : v;
}
