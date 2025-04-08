import { test, expect } from './setup';

test.describe('Test Setup', () => {
	test('should initialize server correctly', async ({ client }) => {
		const response = await client.getServerVersion();
		expect(response).toBeDefined();
		expect(response?.name).toBe('cheqd-mcp-toolkit-server');
	});
	test('check for expected tools', async ({ client }) => {
		const tools = await client.listTools();
		expect(tools.tools).toBeDefined();
		// Extract the names of the tools
		const toolNames: string[] = [];
		for (let i = 0; i < tools.tools.length; i++) {
			const toolName = tools.tools[i].name;
			if (toolName) toolNames.push(toolName);
		}
		// Verify essential tools are available
		expect(toolNames).toContain('create-did');
		expect(toolNames).toContain('resolve-did');
		expect(toolNames).toContain('create-did-linked-resource');
		expect(toolNames).toContain('create-schema');
		expect(toolNames).toContain('create-credential-definition');
		expect(toolNames).toContain('accept-connection-invitation-didcomm');
		expect(toolNames).toContain('create-credential-offer-didcomm');
		expect(toolNames).toContain('get-credential-record');
		expect(toolNames).toContain('create-proof-request-didcomm');
		expect(toolNames).toContain('get-proof-record');
		expect(toolNames).toContain('accept-proof-request');
	});
});
