import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodRawShape } from 'zod';
export interface ToolDefinition<Args extends ZodRawShape> {
    readonly name: string;
    readonly description: string;
    readonly schema: Args;
    handler: ToolCallback<Args>;
}