import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MotomarksConfig } from "../config.js";
import type { MotomarksClient } from "../motomarks-client.js";
import { registerApiEndpointTools } from "./api-endpoints.js";
import { registerBrandTools } from "./brands.js";

export function registerTools(server: McpServer, client: MotomarksClient, config: MotomarksConfig): void {
  registerBrandTools(server, client, config);
  registerApiEndpointTools(server, config);
}
