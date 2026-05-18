import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "find_brand_logo",
    {
      title: "Find Brand Logo",
      description: "Guide an agent through finding a Motomarks brand logo and selecting an asset variant.",
      argsSchema: {
        brand: z.string().describe("Brand name, company name, domain, or slug to search for."),
        useCase: z.string().optional().describe("Where the logo will be used, such as website, app UI, or docs."),
      },
    },
    ({ brand, useCase }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Find the best Motomarks logo asset for "${brand}".`,
              useCase ? `Use case: ${useCase}.` : undefined,
              "Use search_brands first, then list_brand_assets for the best slug.",
              "Prefer webp for modern web usage and png when transparency or broad compatibility is needed.",
              "Return the chosen brand slug, asset variant, CDN URL, and a short reason for the choice.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "embed_brand_image",
    {
      title: "Embed Brand Image",
      description: "Create HTML, React, or Markdown snippets using a Motomarks CDN URL.",
      argsSchema: {
        slug: z.string().describe("Motomarks brand slug."),
        framework: z.enum(["html", "react", "markdown"]).default("html").describe("Snippet format to produce."),
      },
    },
    ({ slug, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Build a Motomarks image CDN URL for slug "${slug}" using build_image_url.`,
              `Then produce a ${framework} embed snippet.`,
              "Use descriptive alt text, do not expose secret keys, and only include the publishable-key CDN URL.",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}
