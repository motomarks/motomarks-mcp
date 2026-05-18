import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MotomarksConfig } from "../config.js";
import type { ApiEndpointDescription } from "../types.js";
import { jsonToolResult } from "./shared.js";

const OperationSchema = z.enum(["searchBrands", "getBrand", "listAssets", "imageCdn"]);

export function registerApiEndpointTools(server: McpServer, config: MotomarksConfig): void {
  server.registerTool(
    "describe_api_endpoint",
    {
      title: "Describe Motomarks API Endpoint",
      description: "Return the HTTP endpoint, auth mode, params, and example for a Motomarks operation.",
      inputSchema: {
        operation: OperationSchema.describe("The Motomarks API operation to describe."),
      },
    },
    ({ operation }) => jsonToolResult(describeEndpoint(operation, config)),
  );
}

export function describeEndpoint(operation: z.infer<typeof OperationSchema>, config: MotomarksConfig): ApiEndpointDescription {
  const apiBase = config.apiBaseUrl.replace(/\/$/, "");
  const imageBase = config.imageBaseUrl.replace(/\/$/, "");

  switch (operation) {
    case "searchBrands":
      return {
        operation,
        method: "GET",
        url: `${apiBase}/api/v1/brands`,
        auth: "secret-key",
        params: {
          q: "Optional brand search query.",
          limit: "Optional result limit from 1 to 100.",
        },
        example: `curl -H "Authorization: Bearer sk_..." "${apiBase}/api/v1/brands?q=toyota&limit=5"`,
      };
    case "getBrand":
      return {
        operation,
        method: "GET",
        url: `${apiBase}/api/v1/brands/{slug}`,
        auth: "secret-key",
        params: {
          slug: "Required URL-friendly brand slug, e.g. toyota.",
        },
        example: `curl -H "Authorization: Bearer sk_..." "${apiBase}/api/v1/brands/toyota"`,
      };
    case "listAssets":
      return {
        operation,
        method: "GET",
        url: `${apiBase}/api/v1/brands/{slug}/assets`,
        auth: "secret-key",
        params: {
          slug: "Required URL-friendly brand slug.",
          type: "Optional logo variant: full, badge, or wordmark.",
          format: "Optional asset format, such as webp, png, or svg.",
          aspect: "Optional aspect ratio: square or height.",
        },
        example: `curl -H "Authorization: Bearer sk_..." "${apiBase}/api/v1/brands/toyota/assets?type=badge&format=png"`,
      };
    case "imageCdn":
      return {
        operation,
        method: "GET",
        url: `${imageBase}/{slug}`,
        auth: "publishable-key",
        params: {
          slug: "Required URL-friendly brand slug.",
          token: "Required publishable key starting with pk_.",
          type: "Optional logo variant: full, badge, or wordmark. Default: full.",
          format: "Optional output format: webp or png. Default: webp.",
          size: "Optional size: xs, sm, md, lg, or xl. Default: md.",
          aspect: "Optional aspect ratio: square or height. Default: square.",
        },
        example: `${imageBase}/toyota?type=badge&size=lg&format=png&token=pk_...`,
      };
  }
}
