import { describe, it, expect } from "vitest";
import { dateInTimezone, todayISO, corsHeaders, securityHeaders, isValidDate, isValidEmail, clampLen } from "../src/helpers";

describe("dateInTimezone", () => {
  // 2026-09-11 23:30 UTC is 2026-09-12 00:30 in Africa/Lagos (UTC+1).
  const boundaryUtc = new Date(Date.UTC(2026, 8, 11, 23, 30, 0));
  it("computes the calendar date in the given IANA zone", () => {
    expect(dateInTimezone(boundaryUtc, "Africa/Lagos")).toBe("2026-09-12");
    expect(dateInTimezone(boundaryUtc, "UTC")).toBe("2026-09-11");
    // US East Coast (UTC-4 in September).
    expect(dateInTimezone(boundaryUtc, "America/New_York")).toBe("2026-09-11");
  });
  it("falls back to UTC for an invalid zone", () => {
    expect(dateInTimezone(boundaryUtc, "Not/AZone")).toBe("2026-09-11");
  });
  it("todayISO uses the zone when provided and UTC otherwise", () => {
    const utc = todayISO();
    const manual = new Date().toISOString().slice(0, 10);
    expect(utc === manual || utc === dateInTimezone(new Date())).toBe(true);
    expect(todayISO("Africa/Lagos")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("corsHeaders", () => {
  it("returns no headers when there is no origin", () => {
    expect(corsHeaders("https://a.com", null)).toEqual({});
  });
  it("denies cross-origin when no allowlist is configured", () => {
    expect(corsHeaders(undefined, "https://evil.com")).toEqual({});
    expect(corsHeaders("", "https://evil.com")).toEqual({});
  });
  it("allows and echoes a configured origin", () => {
    const h = corsHeaders("https://a.com, https://b.com", "https://a.com");
    expect(h["Access-Control-Allow-Origin"]).toBe("https://a.com");
    expect(h.Vary).toBe("Origin");
    expect(h["Access-Control-Allow-Methods"]).toContain("POST");
  });
  it("denies an origin not on the list", () => {
    expect(corsHeaders("https://a.com", "https://b.com")).toEqual({});
  });
  it("supports an explicit wildcard", () => {
    const h = corsHeaders("*", "https://anything.com");
    expect(h["Access-Control-Allow-Origin"]).toBe("*");
    expect(h.Vary).toBeUndefined();
  });
});

describe("securityHeaders", () => {
  it("sets nosniff, frame-deny and no-referrer", () => {
    const h = securityHeaders();
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Referrer-Policy"]).toBe("no-referrer");
  });
});

describe("isValidDate", () => {
  it("accepts real past/present dates", () => {
    expect(isValidDate("2020-02-29")).toBe(true); // leap day
    expect(isValidDate("2026-09-12")).toBe(true);
  });
  it("rejects impossible dates", () => {
    expect(isValidDate("2021-02-29")).toBe(false);
    expect(isValidDate("2020-13-01")).toBe(false);
    expect(isValidDate("12-09-2020")).toBe(false);
    expect(isValidDate("2020-02-2")).toBe(false);
  });
  it("rejects future dates by default and allows them on request", () => {
    expect(isValidDate("2999-01-01")).toBe(false);
    expect(isValidDate("2999-01-01", true)).toBe(true);
  });
});

describe("isValidEmail", () => {
  it("accepts plausible addresses", () => {
    expect(isValidEmail("a.b+c@example.co.uk")).toBe(true);
  });
  it("rejects junk", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});

describe("clampLen", () => {
  it("passes short strings and null through", () => {
    expect(clampLen("abc", 10)).toBe("abc");
    expect(clampLen(null, 10)).toBeNull();
  });
  it("truncates long strings", () => {
    expect(clampLen("abcdef", 3)).toBe("abc");
  });
});
