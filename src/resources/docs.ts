import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MotomarksConfig } from "../config.js";
import type { MotomarksClient } from "../motomarks-client.js";

export function registerResources(server: McpServer, client: MotomarksClient, config: MotomarksConfig): void {
  server.registerResource(
    "image-cdn-docs",
    "motomarks://docs/image-cdn",
    {
      title: "Motomarks Image CDN",
      description: "CDN URL format and query parameters for Motomarks brand images.",
      mimeType: "text/markdown",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "text/markdown",
          text: imageCdnDocs(config),
        },
      ],
    }),
  );

  server.registerResource(
    "api-v1-docs",
    "motomarks://docs/api-v1",
    {
      title: "Motomarks API v1",
      description: "Motomarks API v1 auth and endpoint summary.",
      mimeType: "text/markdown",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "text/markdown",
          text: apiV1Docs(config),
        },
      ],
    }),
  );

  server.registerResource(
    "brand",
    new ResourceTemplate("motomarks://brand/{slug}", { list: undefined }),
    {
      title: "Motomarks Brand",
      description: "Dynamic Motomarks brand resource by slug.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const slug = String(variables.slug);
      const brand = await client.getBrand(slug);

      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(brand, null, 2),
          },
        ],
      };
    },
  );
}

function imageCdnDocs(config: MotomarksConfig): string {
  return `# Motomarks Image CDN

Base URL: \`${config.imageBaseUrl}/{slug}\`

Authentication uses a publishable key in the \`token\` query parameter.

Query parameters:

- \`token\`: required publishable key starting with \`pk_\`.
- \`type\`: optional logo variant, one of \`full\`, \`badge\`, or \`wordmark\`. Default: \`full\`.
- \`format\`: optional output format, one of \`webp\` or \`png\`. Default: \`webp\`.
- \`size\`: optional image size, one of \`xs\`, \`sm\`, \`md\`, \`lg\`, or \`xl\`. Default: \`md\`.
- \`aspect\`: optional aspect ratio, one of \`square\` or \`height\`. Default: \`square\`.

Example:

\`\`\`
${config.imageBaseUrl}/toyota?type=badge&size=lg&format=png&token=pk_...
\`\`\`
`;
}

function apiV1Docs(config: MotomarksConfig): string {
  return `# Motomarks API v1

Base URL: \`${config.apiBaseUrl}\`

Authentication uses a secret key in the \`Authorization\` header:

\`\`\`
Authorization: Bearer sk_...
\`\`\`

Endpoints:

- \`GET /api/v1/brands?q=&limit=\`: search published brands.
- \`GET /api/v1/brands/{slug}\`: get a published brand by slug.
- \`GET /api/v1/brands/{slug}/assets?type=&format=&aspect=\`: list brand assets.

Secret keys must not be exposed in client-side code, README examples, screenshots, or agent outputs.
`;
}
