import { test, expect } from './setup';
import { state } from './state';

test.describe('AnonCreds Operations', () => {
	// Setup for all AnonCreds tests
	test.beforeAll('Setting up AnonCreds test suite', async ({ client, parseToolResponse }) => {
		// Skip all tests if no DID is available
		test.skip(!state.testDid, 'No DID available for AnonCreds operations');
		const result = await client.callTool({
			name: 'create-schema',
			arguments: {
				schema: {
					issuerId: state.testDid,
					name: 'Test Schema',
					version: '1.0',
					attrNames: ['score'],
				},
				options: {
					network: 'testnet',
				},
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('schemaState');
		expect(data.schemaState.state).toBe('finished');
		expect(data.schemaState.schemaId).toMatch(/^did:cheqd:testnet:/);
		state.testSchemaId = data.schemaState.schemaId;
		expect(data.schemaState.schema.issuerId).toBe(state.testDid);
		expect(data.schemaState.schema.name).toBe('Test Schema');
		expect(data.schemaState.schema.version).toBe('1.0');
	});

	// Cleanup after all AnonCreds tests
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('AnonCreds Operations test suite completed');
	});

	test('should list schemas in wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-schemas',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);
	});
	test('should get specific schema from wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'get-schema',
			arguments: { schemaId: state.testSchemaId },
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('schema');
		expect(data.schemaId).toBe(state.testSchemaId);
		expect(data.schema).toHaveProperty('issuerId');
		expect(data.schema).toHaveProperty('name');
		expect(data.schema).toHaveProperty('version');
		expect(data.schema).toHaveProperty('attrNames');
	});

	test('should create a credential definition', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'create-credential-definition',
			arguments: {
				credentialDefinition: {
					issuerId: state.testDid,
					schemaId: state.testSchemaId,
					tag: 'default',
				},
				options: {
					supportRevocation: false,
				},
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('credentialDefinitionState');
		expect(data.credentialDefinitionState.state).toBe('finished');
		expect(data.credentialDefinitionState).toHaveProperty('credentialDefinition');
		const credDef = data.credentialDefinitionState.credentialDefinition;
		expect(data.credentialDefinitionState.credentialDefinitionId).toMatch(/^did:cheqd:testnet:/);
		state.testCredentialDefinitionId = data.credentialDefinitionState.credentialDefinitionId;
		expect(credDef.issuerId).toBe(state.testDid);
		expect(credDef.schemaId).toBe(state.testSchemaId);
		expect(credDef.type).toBe('CL');
		expect(credDef.tag).toBe('default');
	});

	test('should list all credential definitions in wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-credential-definitions',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);
	});
	test('should get specific credential definition from wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'get-credential-definition',
			arguments: { credentialDefinitionId: state.testCredentialDefinitionId },
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('credentialDefinition');
		expect(data.credentialDefinitionId).toBe(state.testCredentialDefinitionId);
		expect(data.credentialDefinition).toHaveProperty('issuerId');
		expect(data.credentialDefinition).toHaveProperty('schemaId');
		expect(data.credentialDefinition).toHaveProperty('tag');
	});
});
