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

// Convert a single D1 row to a friendly camelCase object.
export function rowToJson(row: Record<string, unknown>): Record<string, unknown> {
  return row;
}

// -------- auth header extraction --------

export function corsHeaders(allowedOrigins?: string): Record<string, string> {
  const origin = allowedOrigins || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
