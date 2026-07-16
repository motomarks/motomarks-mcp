<p align="center">
  <img src="images/motomarks_logo.svg" alt="Motomarks" width="320">
</p>

<h1 align="center">Motomarks MCP Server</h1>

<p align="center">
  <b>The official Model Context Protocol (MCP) server for Motomarks: a cloud-hosted bridge that gives your AI tools secure, real-time access to the Motomarks car logo API and image CDN.</b>
</p>

<p align="center">
  MCP Registry: <code>io.motomarks/mcp</code> · Auth: OAuth 2.1 or API key · Hosting: Motomarks Cloud
</p>

The Motomarks MCP Server connects MCP-compatible clients to the Motomarks brand library. Once configured, your AI tools can search automotive brands, fetch brand data and color palettes, browse logo assets, and generate ready-to-embed CDN image URLs. Authentication uses **OAuth 2.1** (browser sign-in) or a **Motomarks secret API key**, so every request respects your plan and rate limits.

With the Motomarks MCP Server, you can:

- **Search and inspect** any published car brand: names, slugs, descriptions, colors, palettes, social links, and company facts.
- **Browse logo assets** per brand: full logos, badges, and wordmarks in webp, png, and svg across five sizes.
- **Generate CDN image URLs** authenticated with your publishable key, ready to paste into HTML, React, or Markdown.
- **Check your account**: plan, attribution status, and today's API usage.

## One-click setup

| [Add to Cursor](https://cursor.com/en/install-mcp?name=Motomarks&config=eyJ1cmwiOiJodHRwczovL21vdG9tYXJrcy5pby9hcGkvbWNwIn0%3D) | [Add to VS Code](https://vscode.dev/redirect/mcp/install?name=Motomarks&config=%7B%22url%22%3A%22https%3A%2F%2Fmotomarks.io%2Fapi%2Fmcp%22%2C%22type%22%3A%22http%22%7D) |
| --- | --- |
| Reference brand logos directly from your codebase. | Search brands and embed logos via GitHub Copilot. |

## Endpoint

```
https://motomarks.io/api/mcp
```

Transport: streamable HTTP. On first connection your client runs a browser-based OAuth flow (dynamic client registration + PKCE) against your Motomarks account. No JSON editing or manual token handling required.

## Supported clients

| Client | Configuration |
| --- | --- |
| Claude (Claude.ai, Desktop, Code) | Add a custom connector with the endpoint URL, or use `claude mcp add --transport http motomarks https://motomarks.io/api/mcp` |
| Cursor | One-click install above, or add the URL under Settings → MCP |
| VS Code (GitHub Copilot) | One-click install above, or `"motomarks": { "type": "http", "url": "https://motomarks.io/api/mcp" }` in `mcp.json` |
| Google Gemini CLI | `gemini extensions install` with this repo, or add the `httpUrl` to `settings.json` |
| Any stdio-only client | Connect through the [mcp-remote](https://www.npmjs.com/package/mcp-remote) proxy (below) |

### Local proxy (stdio clients)

For clients that only speak stdio, connect through [mcp-remote](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "motomarks": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://motomarks.io/api/mcp"]
    }
  }
}
```

Requires Node.js 20+. The proxy opens a browser for OAuth sign-in and caches tokens locally.

### Headless / API key authentication

For CI, backends, or non-interactive setups, authenticate with a Motomarks **secret API key** (`sk_...`, created in your [dashboard](https://motomarks.io/dashboard)) instead of OAuth by sending it as a Bearer token:

```
Authorization: Bearer sk_...
```

With the local proxy:

```json
{
  "mcpServers": {
    "motomarks": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://motomarks.io/api/mcp",
        "--header",
        "Authorization: Bearer sk_..."
      ]
    }
  }
}
```

## Supported tools

| Tool | Intent | Description |
| --- | --- | --- |
| `search_brands` | read | Search published brands by name, company, or slug; optionally include CDN image URLs |
| `get_brand` | read | Full brand detail: description, colors, palette, social links, company facts, FAQs |
| `list_brand_assets` | read | Available logo assets (type, format, size, aspect, dimensions) with CDN URLs |
| `build_image_url` | read | Deterministic CDN image URL using your publishable key |
| `describe_api_endpoint` | read | HTTP reference for the raw REST API operations |
| `get_account` | read | Your plan, attribution status, and today's usage vs. limit |

Resources: `motomarks://docs/image-cdn`, `motomarks://docs/api-v1`, `motomarks://brand/{slug}`.
Prompts: `find_brand_logo`, `embed_brand_image`.

## Example workflows

- "Add the BMW badge logo to this pricing table."
- "What are Lamborghini's brand colors? Give me the full palette."
- "List every wordmark asset for Toyota and pick the best one for a dark navbar."
- "How many API requests do I have left today?"

## Data and security

- All traffic is encrypted in transit over HTTPS.
- OAuth 2.1 (PKCE, dynamic client registration) or scoped API keys control access.
- Tools respect your Motomarks plan, attribution requirements, and rate limits.
- Secret keys are never echoed back by tools; account output masks them.

MCP clients can act on your behalf. Only use trusted clients, prefer least privilege, and review your connected apps in the Motomarks dashboard. See [SECURITY.md](SECURITY.md) for reporting.

## Publishing (maintainers)

This repo contains no server code — the server is hosted at `https://motomarks.io/api/mcp`. Publishing means listing the endpoint in registries and directories:

1. Verify the `motomarks.io` domain for the `io.motomarks` registry namespace (DNS or HTTP challenge), then publish the manifest: `mcp-publisher login dns --domain motomarks.io && mcp-publisher publish` with [server.json](server.json).
2. Submit the registry entry / repo to MCP directories (official MCP Registry, Cursor marketplace, Claude connectors, PulseMCP, Smithery, Glama).

## Support

- Docs: [motomarks.io/docs/mcp](https://motomarks.io/docs/mcp)
- Issues: [GitHub issues](https://github.com/motomarks/motomarks-mcp/issues)
- Email: [support@motomarks.io](mailto:support@motomarks.io)
