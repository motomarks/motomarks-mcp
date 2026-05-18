import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildCdnImageUrl } from "../cdn.js";
import type { MotomarksConfig } from "../config.js";
import type { MotomarksClient } from "../motomarks-client.js";
import type { Brand, BrandAsset, ImageOptions } from "../types.js";
import { jsonToolResult, toolErrorResult } from "./shared.js";

const AssetTypeSchema = z.enum(["full", "badge", "wordmark"]);
const CdnFormatSchema = z.enum(["webp", "png"]);
const AssetFormatSchema = z.enum(["webp", "png", "svg"]);
const AssetSizeSchema = z.enum(["xs", "sm", "md", "lg", "xl"]);
const AssetAspectSchema = z.enum(["square", "height"]);

export function registerBrandTools(server: McpServer, client: MotomarksClient, config: MotomarksConfig): void {
  server.registerTool(
    "search_brands",
    {
      title: "Search Motomarks Brands",
      description: "Search published Motomarks brands and optionally include ready-to-use CDN image URLs.",
      inputSchema: {
        query: z.string().trim().optional().describe("Brand name, company name, or slug to search for."),
        limit: z.number().int().min(1).max(100).default(10).describe("Maximum number of brands to return."),
        includeImageUrls: z.boolean().default(false).describe("Include generated CDN image URLs for each brand."),
        type: AssetTypeSchema.default("full").describe("Logo variant for generated CDN image URLs."),
        format: CdnFormatSchema.default("webp").describe("Image format for generated CDN URLs."),
        size: AssetSizeSchema.default("md").describe("Image size for generated CDN URLs."),
        aspect: AssetAspectSchema.default("square").describe("Image aspect ratio for generated CDN URLs."),
      },
    },
    async (args) => {
      try {
        return jsonToolResult(await handleSearchBrands(client, config, args));
      } catch (error) {
        return toolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_brand",
    {
      title: "Get Motomarks Brand",
      description: "Get a published Motomarks brand by slug with optional asset summary.",
      inputSchema: {
        slug: z.string().trim().min(1).describe("URL-friendly brand slug, e.g. toyota."),
        includeAssets: z.boolean().default(false).describe("Also include a compact asset summary."),
        includeCdnUrls: z.boolean().default(true).describe("Include generated CDN URLs when assets are included."),
      },
    },
    async ({ slug, includeAssets, includeCdnUrls }) => {
      try {
        return jsonToolResult(await handleGetBrand(client, config, { slug, includeAssets, includeCdnUrls }));
      } catch (error) {
        return toolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "list_brand_assets",
    {
      title: "List Motomarks Brand Assets",
      description: "List available Motomarks assets for a brand and optionally include generated CDN image URLs.",
      inputSchema: {
        slug: z.string().trim().min(1).describe("URL-friendly brand slug, e.g. toyota."),
        type: AssetTypeSchema.optional().describe("Optional asset type filter."),
        format: AssetFormatSchema.optional().describe("Optional asset format filter."),
        aspect: AssetAspectSchema.optional().describe("Optional asset aspect filter."),
        includeCdnUrls: z.boolean().default(true).describe("Include generated CDN URLs for webp/png assets."),
      },
    },
    async ({ slug, type, format, aspect, includeCdnUrls }) => {
      try {
        return jsonToolResult(await handleListBrandAssets(client, config, { slug, type, format, aspect, includeCdnUrls }));
      } catch (error) {
        return toolErrorResult(error);
      }
    },
  );

  server.registerTool(
    "build_image_url",
    {
      title: "Build Motomarks Image CDN URL",
      description: "Build a deterministic Motomarks image CDN URL using the configured publishable key.",
      inputSchema: {
        slug: z.string().trim().min(1).describe("URL-friendly brand slug, e.g. toyota."),
        type: AssetTypeSchema.default("full").describe("Logo variant."),
        format: CdnFormatSchema.default("webp").describe("Output image format."),
        size: AssetSizeSchema.default("md").describe("Output image size."),
        aspect: AssetAspectSchema.default("square").describe("Output aspect ratio."),
      },
    },
    ({ slug, type, format, size, aspect }) =>
      jsonToolResult(handleBuildImageUrl(config, { slug, type, format, size, aspect })),
  );
}

export async function handleSearchBrands(
  client: Pick<MotomarksClient, "searchBrands">,
  config: MotomarksConfig,
  args: {
    query?: string;
    limit: number;
    includeImageUrls: boolean;
    type: z.infer<typeof AssetTypeSchema>;
    format: z.infer<typeof CdnFormatSchema>;
    size: z.infer<typeof AssetSizeSchema>;
    aspect: z.infer<typeof AssetAspectSchema>;
  },
) {
  const result = await client.searchBrands(args.query, args.limit);
  const imageOptions = toImageOptions(args);

  return {
    query: args.query ?? null,
    count: result.count,
    total: result.total ?? result.count,
    brands: result.data.map((brand) =>
      summarizeBrand(brand, config, args.includeImageUrls ? imageOptions : undefined),
    ),
  };
}

export async function handleGetBrand(
  client: Pick<MotomarksClient, "getBrand" | "listBrandAssets">,
  config: MotomarksConfig,
  args: {
    slug: string;
    includeAssets: boolean;
    includeCdnUrls: boolean;
  },
) {
  const brand = await client.getBrand(args.slug);
  const assets = args.includeAssets ? await client.listBrandAssets(brand.slug) : undefined;

  return {
    brand: summarizeBrand(brand, config, true),
    assets: assets
      ? summarizeAssets(assets.data, config, brand.slug, args.includeCdnUrls)
      : undefined,
  };
}

export async function handleListBrandAssets(
  client: Pick<MotomarksClient, "listBrandAssets">,
  config: MotomarksConfig,
  args: {
    slug: string;
    type?: z.infer<typeof AssetTypeSchema>;
    format?: z.infer<typeof AssetFormatSchema>;
    aspect?: z.infer<typeof AssetAspectSchema>;
    includeCdnUrls: boolean;
  },
) {
  const assets = await client.listBrandAssets(args.slug, {
    type: args.type,
    format: args.format,
    aspect: args.aspect,
  });

  return {
    slug: args.slug,
    count: assets.count,
    assets: summarizeAssets(assets.data, config, args.slug, args.includeCdnUrls),
  };
}

export function handleBuildImageUrl(
  config: MotomarksConfig,
  args: {
    slug: string;
    type: z.infer<typeof AssetTypeSchema>;
    format: z.infer<typeof CdnFormatSchema>;
    size: z.infer<typeof AssetSizeSchema>;
    aspect: z.infer<typeof AssetAspectSchema>;
  },
) {
  return {
    slug: args.slug,
    url: buildCdnImageUrl({
      slug: args.slug,
      token: config.publicKey,
      imageBaseUrl: config.imageBaseUrl,
      type: args.type,
      format: args.format,
      size: args.size,
      aspect: args.aspect,
    }),
    auth: "publishable-key",
  };
}

function summarizeBrand(brand: Brand, config: MotomarksConfig, imageOptions?: ImageOptions | true) {
  const imageUrl =
    imageOptions === true
      ? buildCdnImageUrl({ slug: brand.slug, token: config.publicKey, imageBaseUrl: config.imageBaseUrl })
      : imageOptions
        ? buildCdnImageUrl({ slug: brand.slug, token: config.publicKey, imageBaseUrl: config.imageBaseUrl, ...imageOptions })
        : undefined;

  return {
    name: brand.brandName,
    companyName: brand.companyName,
    slug: brand.slug,
    description: brand.description,
    officialDomain: brand.officialDomain,
    primaryColorHex: brand.primaryColorHex,
    socialLinks: brand.socialLinks,
    lastVerifiedAt: brand.lastVerifiedAt,
    endpoints: {
      brand: `${config.apiBaseUrl}/api/v1/brands/${brand.slug}`,
      assets: `${config.apiBaseUrl}/api/v1/brands/${brand.slug}/assets`,
      logoPage: `${config.apiBaseUrl}/logos/${brand.slug}`,
    },
    imageUrl,
  };
}

function summarizeAssets(assets: BrandAsset[], config: MotomarksConfig, slug: string, includeCdnUrls: boolean) {
  return assets.map((asset) => {
    const canBuildCdnUrl = includeCdnUrls && (asset.format === "webp" || asset.format === "png");

    return {
      id: asset.id,
      type: asset.type,
      format: asset.format,
      size: asset.size,
      aspect: asset.aspect,
      width: asset.width,
      height: asset.height,
      fileUrl: asset.fileUrl,
      cdnUrl: canBuildCdnUrl
        ? buildCdnImageUrl({
            slug,
            token: config.publicKey,
            imageBaseUrl: config.imageBaseUrl,
            type: asset.type as ImageOptions["type"],
            format: asset.format as ImageOptions["format"],
            size: asset.size as ImageOptions["size"],
            aspect: asset.aspect as ImageOptions["aspect"],
          })
        : undefined,
    };
  });
}

function toImageOptions(args: {
  type: z.infer<typeof AssetTypeSchema>;
  format: z.infer<typeof CdnFormatSchema>;
  size: z.infer<typeof AssetSizeSchema>;
  aspect: z.infer<typeof AssetAspectSchema>;
}): ImageOptions {
  return {
    type: args.type,
    format: args.format,
    size: args.size,
    aspect: args.aspect,
  };
}
