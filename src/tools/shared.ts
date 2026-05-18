import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function jsonToolResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function toolErrorResult(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
}
