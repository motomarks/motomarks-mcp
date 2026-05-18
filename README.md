# Motomarks MCP

`motomarks-mcp` is a Model Context Protocol server for Motomarks brand data. It lets AI agents search brands, fetch brand metadata and assets, and build ready-to-use Motomarks Image CDN URLs.

The server runs over stdio by default, which works with local MCP clients such as Cursor, Claude Desktop, Claude Code, Codex-style agents, and other MCP-compatible tools.

## Features

- Search published Motomarks brands.
- Fetch brand details by slug.
- List available brand assets with optional CDN URLs.
- Build deterministic Motomarks Image CDN URLs.
- Expose docs resources for the Image CDN and API v1.
- Provide prompt templates for finding and embedding brand logos.

## Requirements

- Node.js 20 or newer.
- A Motomarks secret key starting with `sk_` for API lookups.
- A Motomarks publishable key starting with `pk_` for Image CDN URLs.

Secret keys are for server-side use only. Do not put `MOTOMARKS_SECRET_KEY` in client-side code, screenshots, shared config files, or public logs.

## Usage

Run directly with `npx`:

```sh
npx -y motomarks-mcp
```

For local development:

```sh
npm install
npm run build
node dist/index.js
```

## Environment

```sh
MOTOMARKS_SECRET_KEY=sk_00000000000000000000000000000000
MOTOMARKS_PUBLIC_KEY=pk_00000000000000000000000000000000
MOTOMARKS_API_BASE_URL=https://motomarks.io
MOTOMARKS_IMAGE_BASE_URL=https://motomarks.io/img
MOTOMARKS_TIMEOUT_MS=10000
MOTOMARKS_REFERER=https://your-site.example
```

`MOTOMARKS_API_BASE_URL`, `MOTOMARKS_IMAGE_BASE_URL`, `MOTOMARKS_TIMEOUT_MS`, and `MOTOMARKS_REFERER` are optional. The key variables are required at startup.

## Cursor Configuration

Add this to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "motomarks": {
      "command": "npx",
      "args": ["-y", "motomarks-mcp"],
      "env": {
        "MOTOMARKS_SECRET_KEY": "sk_00000000000000000000000000000000",
        "MOTOMARKS_PUBLIC_KEY": "pk_00000000000000000000000000000000"
      }
    }
  }
}
```

For local development before publishing to npm:

```json
{
  "mcpServers": {
    "motomarks": {
      "command": "node",
      "args": ["/absolute/path/to/motomarks-mcp/dist/index.js"],
      "env": {
        "MOTOMARKS_SECRET_KEY": "sk_00000000000000000000000000000000",
        "MOTOMARKS_PUBLIC_KEY": "pk_00000000000000000000000000000000"
      }
    }
  }
}
```

## Claude Desktop Configuration

Claude Desktop uses the same stdio shape in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "motomarks": {
      "command": "npx",
      "args": ["-y", "motomarks-mcp"],
      "env": {
        "MOTOMARKS_SECRET_KEY": "sk_00000000000000000000000000000000",
        "MOTOMARKS_PUBLIC_KEY": "pk_00000000000000000000000000000000"
      }
    }
  }
}
```

On macOS, the file is usually at:

```sh
~/Library/Application Support/Claude/claude_desktop_config.json
```

## Other MCP Clients

Any stdio MCP client can launch the server with:

```sh
node /absolute/path/to/motomarks-mcp/dist/index.js
```

Pass credentials through the process environment. Do not pass secret keys as command-line arguments because process lists and logs can expose them.

## Tools

### `search_brands`

Search published brands.

Inputs:

- `query`: optional brand name, company name, or slug.
- `limit`: result limit from 1 to 100.
- `includeImageUrls`: include generated CDN URLs.
- `type`, `format`, `size`, `aspect`: image options used when URLs are requested.

### `get_brand`

Fetch a brand by slug.

Inputs:

- `slug`: required brand slug.
- `includeAssets`: include a compact asset summary.
- `includeCdnUrls`: include generated CDN URLs for listed assets.

### `list_brand_assets`

List assets for a brand.

Inputs:

- `slug`: required brand slug.
- `type`: optional `full`, `badge`, or `wordmark`.
- `format`: optional `webp`, `png`, or `svg`.
- `aspect`: optional `square` or `height`.
- `includeCdnUrls`: include generated CDN URLs for webp/png assets.

### `build_image_url`

Build a Motomarks Image CDN URL using the configured publishable key. This tool does not call the secret-key API.

Inputs:

- `slug`: required brand slug.
- `type`: `full`, `badge`, or `wordmark`.
- `format`: `webp` or `png`.
- `size`: `xs`, `sm`, `md`, `lg`, or `xl`.
- `aspect`: `square` or `height`.

### `describe_api_endpoint`

Describe a Motomarks HTTP endpoint for agents that need to generate code.

Inputs:

- `operation`: `searchBrands`, `getBrand`, `listAssets`, or `imageCdn`.

## Resources

- `motomarks://docs/image-cdn`
- `motomarks://docs/api-v1`
- `motomarks://brand/{slug}`

## Prompts

- `find_brand_logo`
- `embed_brand_image`

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

Run the optional integration smoke test only when real keys are available:

```sh
MOTOMARKS_SECRET_KEY=sk_... MOTOMARKS_PUBLIC_KEY=pk_... npm run test:integration
```

## Security

- The secret key is only sent in the `Authorization: Bearer` header to Motomarks API v1 endpoints.
- The server redacts configured keys in tool errors.
- Generated CDN URLs include the publishable key because that is the intended browser-facing credential.
- The project does not import private Motomarks monorepo code or connect directly to the Motomarks database.

## License

MIT
