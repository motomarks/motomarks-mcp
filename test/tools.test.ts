import { describe, expect, it, vi } from "vitest";
import type { MotomarksConfig } from "../src/config.js";
import {
  handleBuildImageUrl,
  handleGetBrand,
  handleListBrandAssets,
  handleSearchBrands,
} from "../src/tools/brands.js";
import { describeEndpoint } from "../src/tools/api-endpoints.js";
import type { Brand, BrandAsset } from "../src/types.js";

const config: MotomarksConfig = {
  apiBaseUrl: "https://motomarks.test",
  imageBaseUrl: "https://motomarks.test/img",
  secretKey: "sk_00000000000000000000000000000000",
  publicKey: "pk_00000000000000000000000000000000",
  timeoutMs: 1_000,
};

const brand: Brand = {
  id: "brand_1",
  brandName: "Toyota",
  companyName: "Toyota Motor Corporation",
  description: "Automotive brand.",
  slug: "toyota",
  primaryColorHex: "#eb0a1e",
  officialDomain: "toyota.com",
  socialLinks: null,
  status: "published",
  lastVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const asset: BrandAsset = {
  id: "asset_1",
  brandId: "brand_1",
  type: "badge",
  format: "png",
  size: "lg",
  aspect: "square",
  fileUrl: "s3://example/toyota.png",
  width: 512,
  height: 512,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("tool handlers", () => {
  it("handles search_brands output", async () => {
    const client = {
      searchBrands: vi.fn(async () => ({ data: [brand], count: 1, total: 1 })),
    };

    const result = await handleSearchBrands(client, config, {
      query: "toyota",
      limit: 5,
      includeImageUrls: true,
      type: "full",
      format: "webp",
      size: "md",
      aspect: "square",
    });

    expect(result.brands[0].slug).toBe("toyota");
    expect(result.brands[0].imageUrl).toContain("token=pk_00000000000000000000000000000000");
  });

  it("handles get_brand with assets", async () => {
    const client = {
      getBrand: vi.fn(async () => brand),
      listBrandAssets: vi.fn(async () => ({ data: [asset], count: 1 })),
    };

    const result = await handleGetBrand(client, config, {
      slug: "toyota",
      includeAssets: true,
      includeCdnUrls: true,
    });

    expect(result.brand.slug).toBe("toyota");
    expect(result.assets?.[0].cdnUrl).toContain("type=badge");
  });

  it("handles list_brand_assets filters", async () => {
    const client = {
      listBrandAssets: vi.fn(async () => ({ data: [asset], count: 1 })),
    };

    const result = await handleListBrandAssets(client, config, {
      slug: "toyota",
      type: "badge",
      format: "png",
      aspect: "square",
      includeCdnUrls: true,
    });

    expect(client.listBrandAssets).toHaveBeenCalledWith("toyota", {
      type: "badge",
      format: "png",
      aspect: "square",
    });
    expect(result.assets[0].cdnUrl).toContain("format=png");
  });

  it("handles build_image_url", () => {
    const result = handleBuildImageUrl(config, {
      slug: "toyota",
      type: "badge",
      format: "png",
      size: "lg",
      aspect: "height",
    });

    expect(result.auth).toBe("publishable-key");
    expect(result.url).toContain("size=lg");
  });

  it("describes API endpoints", () => {
    expect(describeEndpoint("imageCdn", config).auth).toBe("publishable-key");
    expect(describeEndpoint("searchBrands", config).auth).toBe("secret-key");
  });
});
