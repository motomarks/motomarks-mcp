import { describe, expect, it, vi } from "vitest";
import { MotomarksApiError, MotomarksClient } from "../src/motomarks-client.js";
import type { MotomarksConfig } from "../src/config.js";

const config: MotomarksConfig = {
  apiBaseUrl: "https://motomarks.test",
  imageBaseUrl: "https://motomarks.test/img",
  secretKey: "sk_00000000000000000000000000000000",
  publicKey: "pk_00000000000000000000000000000000",
  timeoutMs: 1_000,
};

describe("MotomarksClient", () => {
  it("calls brand search with bearer auth and query params", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ data: [], count: 0, total: 0 }), { status: 200 }),
    );
    const client = new MotomarksClient(config, fetchMock);

    await client.searchBrands("toyota", 5);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://motomarks.test/api/v1/brands?q=toyota&limit=5");
    expect((init?.headers as Record<string, string>).authorization).toBe(
      "Bearer sk_00000000000000000000000000000000",
    );
  });

  it("normalizes API errors", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 }),
    );
    const client = new MotomarksClient(config, fetchMock);

    await expect(client.getBrand("toyota")).rejects.toThrow(MotomarksApiError);
  });
});
