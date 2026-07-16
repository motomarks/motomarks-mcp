# Security Policy

## Reporting a vulnerability

Please report security issues privately to [support@motomarks.io](mailto:support@motomarks.io) with "SECURITY" in the subject line. Do not open public issues for vulnerabilities.

We aim to acknowledge reports within 3 business days.

## Scope

- The hosted MCP endpoint at `https://motomarks.io/api/mcp` and its OAuth flow.
- The manifests and setup instructions distributed in this repository.

## Guidance for users

- Prefer OAuth over long-lived API keys where possible.
- Never commit secret keys (`sk_...`) to source control; the MCP tools never require one in tool arguments.
- Review and revoke connected OAuth clients and API keys in your [Motomarks dashboard](https://motomarks.io/dashboard).
- LLM agents are susceptible to prompt injection; only connect trusted MCP clients.
