// Authentication & authorization helpers for the KidMin Harmony API.
// Uses WebCrypto (PBKDF2 for passwords, HMAC-SHA256 for JWTs) so no external
// crypto dependencies are needed on Cloudflare Workers.

export const ROLES = ["admin", "teacher", "parent", "volunteer", "cellLeader", "partner"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

const enc = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ------------------- JWT (HS256) -------------------

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

export async function signToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec = 60 * 60 * 24 * 7
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  };
  const encodedHeader = toBase64Url(enc.encode(JSON.stringify(header)));
  const encodedPayload = toBase64Url(enc.encode(JSON.stringify(body)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSign(secret, signingInput);
  return `${signingInput}.${signature}`;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = await hmacSign(secret, signingInput);
  if (expected !== signature) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload)));
    const exp = payload.exp as number;
    if (exp && exp < Math.floor(Date.now() / 1000)) return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ------------------- Passwords (PBKDF2) -------------------

const ITERATIONS = 100_000;
const HASH_LEN = 32;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_LEN * 8
  );
  return `${ITERATIONS}:${toBase64Url(salt)}:${toBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [iterStr, saltStr, hashStr] = stored.split(":");
    const iterations = parseInt(iterStr, 10);
    const salt = fromBase64Url(saltStr);
    const originalHash = fromBase64Url(hashStr);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      originalHash.length * 8
    );
    const derived = new Uint8Array(bits);
    if (derived.length !== originalHash.length) return false;
    let diff = 0;
    for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ originalHash[i];
    return diff === 0;
  } catch {
    return false;
  }
}

// ------------------- Middleware -------------------

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function authenticate(
  request: Request,
  secret: string
): Promise<AuthUser | null> {
  const token = getBearerToken(request);
  if (!token) return null;
  const payload = await verifyToken(token, secret);
  if (!payload) return null;
  return {
    id: payload.sub as string,
    name: (payload.name as string) ?? "",
    email: (payload.email as string) ?? "",
    role: payload.role as Role,
    avatar: payload.avatar as string | undefined,
  };
}

export function requireRole(user: AuthUser | null, roles: Role[]): boolean {
  if (!user) return false;
  // An admin is allowed anywhere a given role list is accepted; otherwise,
  // require the caller's role to be in the allowed set.
  if (user.role === "admin") return true;
  return roles.includes(user.role);
}
