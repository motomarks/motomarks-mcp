export type AssetType = "full" | "badge" | "wordmark";
export type AssetFormat = "webp" | "png" | "svg";
export type AssetSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AssetAspect = "square" | "height";

export interface Brand {
  id: string;
  brandName: string;
  companyName: string | null;
  description: string | null;
  slug: string;
  primaryColorHex: string | null;
  officialDomain: string | null;
  socialLinks: Record<string, string> | null;
  status: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandAsset {
  id: string;
  brandId: string;
  type: AssetType | string;
  format: AssetFormat | string;
  size: AssetSize | string | null;
  aspect: AssetAspect | string | null;
  fileUrl: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface ImageOptions {
  type?: AssetType;
  format?: Extract<AssetFormat, "webp" | "png">;
  size?: AssetSize;
  aspect?: AssetAspect;
}

export interface ApiEndpointDescription {
  operation: string;
  method: "GET";
  url: string;
  auth: "secret-key" | "publishable-key";
  params: Record<string, string>;
  example: string;
}
