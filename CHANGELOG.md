# Changelog

## 1.0.1

- Added Motomarks logo assets (`assets/logo.svg` for client plugins, `images/motomarks_logo.svg` for the README).
- Wired the Cursor plugin `logo` field and registry `icons` in `server.json`.

## 1.0.0

- Rearchitected as a distribution repo for the hosted Motomarks MCP server at `https://motomarks.io/api/mcp`. This repo no longer contains server code or an npm package.
- Tools run server-side; stdio-only clients connect through the `mcp-remote` proxy.
- OAuth 2.1 (dynamic client registration + PKCE) is the default auth; a secret API key sent as a Bearer header remains available for headless use.
- Added MCP Registry manifest (`server.json`, namespace `io.motomarks/mcp`), client plugin manifests, and a `find-brand-logo` skill.
- New server-side tool: `get_account` (plan, attribution, daily usage). Existing tools (`search_brands`, `get_brand`, `list_brand_assets`, `build_image_url`, `describe_api_endpoint`), resources, and prompts are preserved.

## 0.1.0

- Initial public MCP server (npm package `@motomarks/mcp`) for Motomarks brand search, brand details, brand assets, image CDN URL building, docs resources, and prompt templates.
