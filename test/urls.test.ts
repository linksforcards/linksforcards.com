import { describe, expect, it } from "vitest";
import { normalizeWebsite, safeHttpUrl } from "../src/lib/urls";
import { lockDecision } from "../src/lib/auth-core";
import { localDbAllowed } from "../src/lib/db";

describe("safeHttpUrl", () => {
  it("allows http and https and rejects other schemes", () => {
    expect(safeHttpUrl("https://example.com/shop")).toBe("https://example.com/shop");
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("ftp://example.com")).toBeNull();
    expect(normalizeWebsite("example.com/cards")).toBe("https://example.com/cards");
  });
});

describe("lockDecision", () => {
  it("locks the email before the address", () => {
    expect(lockDecision(5, 0)).toBe("email");
    expect(lockDecision(1, 30)).toBe("ip");
    expect(lockDecision(4, 29)).toBeNull();
  });
});

describe("localDbAllowed", () => {
  it("stays off during a production build and on Vercel", () => {
    const previous = {
      vercel: process.env.VERCEL,
      phase: process.env.NEXT_PHASE,
      lifecycle: process.env.npm_lifecycle_event,
      url: process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    };
    try {
      delete process.env.DATABASE_URL;
      delete process.env.VERCEL;
      process.env.NODE_ENV = "production";
      process.env.npm_lifecycle_event = "build";
      expect(localDbAllowed()).toBe(false);
      delete process.env.npm_lifecycle_event;
      process.env.NEXT_PHASE = "phase-production-build";
      expect(localDbAllowed()).toBe(false);
      delete process.env.NEXT_PHASE;
      process.env.VERCEL = "1";
      process.env.NODE_ENV = "development";
      expect(localDbAllowed()).toBe(false);
    } finally {
      if (previous.vercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = previous.vercel;
      if (previous.phase === undefined) delete process.env.NEXT_PHASE;
      else process.env.NEXT_PHASE = previous.phase;
      if (previous.lifecycle === undefined) delete process.env.npm_lifecycle_event;
      else process.env.npm_lifecycle_event = previous.lifecycle;
      if (previous.url === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous.url;
      if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous.nodeEnv;
    }
  });
});
