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

	// This test checks if the server has the expected resources available
	test('check for expected resources', async ({ client }) => {
		const resources = await client.listResources();
		expect(resources.resources).toBeDefined();
		// Extract the names of the tools
		const names = resources.resources.map((tool) => tool.name).filter(Boolean);
		// Verify essential tools are available
		const expectedResources = [
			'wallet-dids',
			'wallet-credentials',
			'credential-exchange-records',
			'cheqd-schemas',
			'cheqd-credential-definitions',
			'out-of-band-connections',
			'credential-proofs',
			'credo-agent-status',
			'connection-stats',
		];
		for (const resourceName of expectedResources) {
			expect(names).toContain(resourceName);
		}
	});
	// This test checks if the server has the expected resources templates available
	test('check for expected resource templates', async ({ client }) => {
		const resources = await client.listResourceTemplates();
		expect(resources.resourceTemplates).toBeDefined();
		// Extract the names of the tools
		const names = resources.resourceTemplates.map((tool) => tool.name).filter(Boolean);
		// Verify essential tools are available
		const expectedResources = [
			'wallet-credential-by-id',
			'schema-by-id',
			'credential-definition-by-id',
			'out-of-band-connection-by-id',
			'credential-proof-by-id',
		];
		for (const resourceName of expectedResources) {
			expect(names).toContain(resourceName);
		}
	});
	// This test checks if the server has the expected prompts available
	test('check for expected prompts', async ({ client }) => {
		const data = await client.listPrompts();
		expect(data.prompts).toBeDefined();
		// Extract the names of the tools
		const names = data.prompts.map((tool) => tool.name).filter(Boolean);
		// Verify essential tools are available
		const expectedPrompts = [
			'help',
			'create-did-guide',
			'resolve-did',
			'explain-credential-workflow',
			'create-schema-guide',
			'explain-schemas',
			'create-credential-definition-guide',
			'verification-request-guide',
			'connectionless-credential-guide',
			'manage-connections',
		];
		for (const promptName of expectedPrompts) {
			expect(names).toContain(promptName);
		}
	});
});
