import { describe, it, expect } from "vitest";
import {
  signToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  authenticate,
  requireRole,
  MisconfiguredError,
} from "../src/auth";

const SECRET = "test-secret-0123456789abcdef";

describe("JWT (HS256)", () => {
  it("round-trips a valid token", async () => {
    const token = await signToken({ sub: "u1", name: "A", email: "a@b.co", role: "admin" }, SECRET);
    const payload = await verifyToken(token, SECRET);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("u1");
    expect(payload!.role).toBe("admin");
    expect(typeof payload!.exp).toBe("number");
  });

  it("rejects a tampered payload", async () => {
    const token = await signToken({ sub: "u1", role: "parent" }, SECRET);
    const [h, , s] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "u1", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
    expect(await verifyToken(`${h}.${forged}.${s}`, SECRET)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signToken({ sub: "u1" }, SECRET, -60);
    expect(await verifyToken(token, SECRET)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signToken({ sub: "u1" }, "another-secret-0123456789");
    expect(await verifyToken(token, SECRET)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifyToken("not-a-token", SECRET)).toBeNull();
    expect(await verifyToken("a.b", SECRET)).toBeNull();
    expect(await verifyToken("a.b.c", SECRET)).toBeNull();
  });

  it("fails closed when the secret is missing or too short", async () => {
    await expect(signToken({ sub: "u1" }, "")).rejects.toThrowError(MisconfiguredError);
    await expect(signToken({ sub: "u1" }, "short")).rejects.toThrowError(MisconfiguredError);
    await expect(verifyToken("a.b.c", "")).rejects.toThrowError(MisconfiguredError);
  });
});

describe("authenticate()", () => {
  it("returns null without a token", async () => {
    const req = new Request("http://localhost/api/x");
    expect(await authenticate(req, SECRET)).toBeNull();
  });

  it("parses a valid bearer token", async () => {
    const token = await signToken({ sub: "u9", name: "P", email: "p@e.co", role: "parent" }, SECRET);
    const req = new Request("http://localhost/api/x", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await authenticate(req, SECRET);
    expect(user?.id).toBe("u9");
    expect(user?.role).toBe("parent");
  });

  it("fails closed on a misconfigured secret", async () => {
    const req = new Request("http://localhost/api/x", {
      headers: { Authorization: "Bearer a.b.c" },
    });
    await expect(authenticate(req, "")).rejects.toThrowError(MisconfiguredError);
  });

  it("rejects tokens missing a subject", async () => {
    const token = await signToken({ name: "NoSub", role: "admin" }, SECRET);
    const req = new Request("http://localhost/api/x", { headers: { Authorization: `Bearer ${token}` } });
    expect(await authenticate(req, SECRET)).toBeNull();
  });
});

describe("requireRole()", () => {
  const parent = { id: "1", name: "P", email: "p@e.co", role: "parent" as const };
  const admin = { id: "2", name: "A", email: "a@e.co", role: "admin" as const };
  it("allows listed roles", () => {
    expect(requireRole(parent, ["parent", "teacher"])).toBe(true);
  });
  it("denies unlisted roles", () => {
    expect(requireRole(parent, ["admin", "teacher"])).toBe(false);
  });
  it("always allows admin", () => {
    expect(requireRole(admin, ["partner"])).toBe(true);
  });
  it("denies null users", () => {
    expect(requireRole(null, ["admin"])).toBe(false);
  });
});

describe("PBKDF2 password hashing", () => {
  it("verifies correct passwords and rejects wrong ones", async () => {
    const hash = await hashPassword("correct horse");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("correct horsz", hash)).toBe(false);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("fails closed on malformed stored hashes", async () => {
    expect(await verifyPassword("x", "garbage")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "1::")).toBe(false);
  });
});
