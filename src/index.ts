#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConfigError, loadConfig, redactText } from "./config.js";
import { MotomarksClient } from "./motomarks-client.js";
import { registerPrompts } from "./prompts/index.js";
import { registerResources } from "./resources/docs.js";
import { registerTools } from "./tools/index.js";

export async function main(): Promise<void> {
  const config = loadConfig();
  const client = new MotomarksClient(config);

  const server = new McpServer({
    name: "motomarks-mcp",
    version: "0.1.0",
  });

  registerTools(server, client, config);
  registerResources(server, client, config);
  registerPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const status = error instanceof ConfigError ? "Configuration error" : "Motomarks MCP server failed";
  console.error(`${status}: ${redactText(message)}`);
  process.exit(1);
});
