import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig, redactText, sanitizeApiToken } from "../src/config.js";

describe("config", () => {
  it("loads valid environment configuration", () => {
    const config = loadConfig({
      MOTOMARKS_SECRET_KEY: "sk_00000000000000000000000000000000",
      MOTOMARKS_PUBLIC_KEY: "pk_00000000000000000000000000000000",
    });

    expect(config.apiBaseUrl).toBe("https://motomarks.io");
    expect(config.imageBaseUrl).toBe("https://motomarks.io/img");
    expect(config.timeoutMs).toBe(10_000);
  });

  it("rejects invalid keys", () => {
    expect(() =>
      loadConfig({
        MOTOMARKS_SECRET_KEY: "pk_00000000000000000000000000000000",
        MOTOMARKS_PUBLIC_KEY: "pk_00000000000000000000000000000000",
      }),
    ).toThrow(ConfigError);
  });

  it("sanitizes expected Motomarks key formats", () => {
    expect(sanitizeApiToken(" sk_00000000000000000000000000000000 ")).toBe(
      "sk_00000000000000000000000000000000",
    );
    expect(sanitizeApiToken("sk_not-valid")).toBeNull();
  });

  it("redacts configured keys from text", () => {
    const secretKey = "sk_00000000000000000000000000000000";
    const publicKey = "pk_00000000000000000000000000000000";

    expect(redactText(`keys: ${secretKey} ${publicKey}`, { secretKey, publicKey })).not.toContain(secretKey);
  });
});
