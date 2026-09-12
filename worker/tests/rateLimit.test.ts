import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "../src/rateLimit";

describe("rateLimit (fixed window)", () => {
  it("allows up to the limit, then rejects", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(false);
    expect(rateLimit(key, 3, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });

  it("resets after the window expires", async () => {
    const key = `w:${Math.random()}`;
    expect(rateLimit(key, 1, 30)).toBe(true);
    expect(rateLimit(key, 1, 30)).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(rateLimit(key, 1, 30)).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads cf-connecting-ip when present", () => {
    const c = { req: { raw: new Request("http://x", { headers: { "cf-connecting-ip": "1.2.3.4" } }) } };
    expect(clientIp(c as any)).toBe("1.2.3.4");
  });
  it("falls back locally", () => {
    const c = { req: { raw: new Request("http://x") } };
    expect(clientIp(c as any)).toBe("local");
  });
});
