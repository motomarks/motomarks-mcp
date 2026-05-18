import type { ImageOptions } from "./types.js";

export interface CdnUrlOptions extends ImageOptions {
  slug: string;
  token: string;
  imageBaseUrl?: string;
}

export function buildCdnImageUrl({
  slug,
  token,
  imageBaseUrl = "https://motomarks.io/img",
  type,
  format,
  size,
  aspect,
}: CdnUrlOptions): string {
  const baseUrl = imageBaseUrl.replace(/\/$/, "");
  const params = new URLSearchParams();

  if (type && type !== "full") params.set("type", type);
  if (format && format !== "webp") params.set("format", format);
  if (size && size !== "md") params.set("size", size);
  if (aspect && aspect !== "square") params.set("aspect", aspect);
  params.set("token", token);

  return `${baseUrl}/${encodeURIComponent(slug)}?${params.toString()}`;
}
