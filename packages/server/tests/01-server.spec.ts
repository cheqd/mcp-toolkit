import { test, expect } from './setup';

test.describe('Test Setup', () => {
	// No setup or shutdown needed for this simple test group

	// Test for server initialization
	test('should initialize server correctly', async ({ client }) => {
		const response = await client.getServerVersion();
		expect(response).toBeDefined();
		expect(response?.name).toBe('cheqd-mcp-toolkit-server');
	});

	// Test for server tools
	// This test checks if the server has the expected tools available
	test('check for expected tools', async ({ client }) => {
		const tools = await client.listTools();
		expect(tools.tools).toBeDefined();
		// Extract the names of the tools
		const toolNames = tools.tools.map((tool) => tool.name).filter(Boolean);
		// Verify essential tools are available
		const expectedTools = [
			'create-did',
			'resolve-did',
			'create-did-linked-resource',
			'create-schema',
			'create-credential-definition',
			'accept-connection-invitation-didcomm',
			'create-credential-offer-didcomm',
			'get-credential-record',
			'create-proof-request-didcomm',
			'get-proof-record',
			'accept-proof-request',
		];
		for (const toolName of expectedTools) {
			expect(toolNames).toContain(toolName);
		}
	});
});
