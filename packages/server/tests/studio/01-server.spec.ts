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
		console.log(toolNames)
		// Verify essential tools are available
		const expectedTools = [
			'create-did',
			'resolve-did',
			'update-did',
			'deactivate-did',
			'list-did',
			'create-did-linked-resource',
			'resolve-did-linked-resource',
			'list-credential-exchange-records',
			'issue-credential',
			'verify-credential',
			'revoke-credential',
			'suspend-credential',
			'reinstate-credential',
			'statuslist-create',
			'statuslist-update'
		];
		for (const toolName of expectedTools) {
			expect(toolNames).toContain(toolName);
		}
	});
});
