/**
 * Transport Utilities
 *
 * Utilities for creating SSE transport compatible objects.
 * Follows DRY principle to avoid duplication.
 */

import type { WritableStreamDefaultWriter } from 'stream/web';

/**
 * Creates a mock Response object compatible with SSEServerTransport
 */
export function createMockResponse(writer: WritableStreamDefaultWriter<Uint8Array>) {
  return {
    write: (chunk: string) => writer.write(new TextEncoder().encode(chunk)),
    end: () => writer.close(),
    writeHead: (_status: number, _headers: unknown) => {
      // Ignored for Next.js Response
    },
    on: (_event: string, _cb: unknown) => {
      // Event handling not needed for Next.js
    },
  };
}

/**
 * Creates SSE headers for MCP protocol
 */
export function createSseHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
}
