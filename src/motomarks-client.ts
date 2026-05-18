import { redactText, type MotomarksConfig } from "./config.js";
import type { Brand, BrandAsset } from "./types.js";

interface ApiListResponse<T> {
  data: T[];
  count: number;
  total?: number;
}

interface ApiItemResponse<T> {
  data: T;
}

export class MotomarksApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MotomarksApiError";
  }
}

export class MotomarksClient {
  constructor(
    private readonly config: MotomarksConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async searchBrands(query?: string, limit = 10): Promise<ApiListResponse<Brand>> {
    const url = this.url("/api/v1/brands");
    if (query?.trim()) url.searchParams.set("q", query.trim());
    url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));

    return this.request<ApiListResponse<Brand>>(url);
  }

  async getBrand(slug: string): Promise<Brand> {
    const response = await this.request<ApiItemResponse<Brand>>(this.url(`/api/v1/brands/${encodeURIComponent(slug)}`));
    return response.data;
  }

  async listBrandAssets(
    slug: string,
    filters: {
      type?: string;
      format?: string;
      aspect?: string;
    } = {},
  ): Promise<ApiListResponse<BrandAsset>> {
    const url = this.url(`/api/v1/brands/${encodeURIComponent(slug)}/assets`);
    if (filters.type) url.searchParams.set("type", filters.type);
    if (filters.format) url.searchParams.set("format", filters.format);
    if (filters.aspect) url.searchParams.set("aspect", filters.aspect);

    return this.request<ApiListResponse<BrandAsset>>(url);
  }

  endpoint(path: string): string {
    return this.url(path).toString();
  }

  private url(path: string): URL {
    return new URL(path, `${this.config.apiBaseUrl}/`);
  }

  private async request<T>(url: URL): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: "GET",
        headers: this.headers(),
        signal: controller.signal,
      });

      const rawBody = await response.text();
      const body = parseJson(rawBody);

      if (!response.ok) {
        const message = getApiErrorMessage(body, response.statusText);
        throw new MotomarksApiError(redactText(message, this.config), response.status);
      }

      return body as T;
    } catch (error) {
      if (error instanceof MotomarksApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new MotomarksApiError(`Motomarks API request timed out after ${this.config.timeoutMs}ms.`);
      }

      const message = error instanceof Error ? error.message : "Unknown Motomarks API error";
      throw new MotomarksApiError(redactText(message, this.config));
    } finally {
      clearTimeout(timeout);
    }
  }

  private headers(): HeadersInit {
    const headers: HeadersInit = {
      accept: "application/json",
      authorization: `Bearer ${this.config.secretKey}`,
      "user-agent": "motomarks-mcp/0.1.0",
    };

    if (this.config.referer) {
      headers.referer = this.config.referer;
    }

    return headers;
  }
}

function parseJson(rawBody: string): unknown {
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    return { message: rawBody };
  }
}

function getApiErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (typeof message === "string") return message;
  }

  return fallback || "Motomarks API request failed.";
}
