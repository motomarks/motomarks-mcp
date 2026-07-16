# Contributing

Thanks for your interest in the Motomarks MCP Server.

The hosted server (tools, resources, prompts) is developed in the main Motomarks codebase; this repository distributes the public endpoint, client setup instructions, and registry manifests.

## What we accept here

- Corrections to client setup instructions in the README.
- Registry/manifest updates (`server.json`, client plugin manifests).
- Skill improvements under `skills/`.

## What to file elsewhere

- Tool behavior, missing brands, or data issues: email [support@motomarks.io](mailto:support@motomarks.io).
- Security issues: see [SECURITY.md](SECURITY.md).

## Testing a change locally

Point any MCP client at the hosted endpoint, or use the stdio proxy:

```bash
npx -y mcp-remote https://motomarks.io/api/mcp
```
