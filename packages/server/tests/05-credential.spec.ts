import { test, expect } from './setup';
import { state } from './state';

test.describe('Credential Operations', () => {
	// Setup for all Credential tests
	test.beforeAll(async () => {
		// Skip all tests in this suite if prerequisites aren't met
		test.skip(!state.connectionId, 'No active connection available for credential operations');
		test.skip(!state.testCredentialDefinitionId, 'No credential definition available');
		// No other setup needed
	});

	// Cleanup after all Credential tests
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('Credential Operations test suite completed');
	});

	// TODO: Update the testcase after fxing the issue with large QR Code
	// Negative Test: creating a connectionless credential offer fails
	test('should not create a connectionless credential offer', async ({ client, parseFlexibleToolResponse }) => {
		const result = await client.callTool({
			name: 'create-credential-offer-connectionless',
			arguments: { attributes: { score: '80' }, credentialDefinitionId: state.testCredentialDefinitionId },
		});

		const data = parseFlexibleToolResponse(result);
		// Validate error message
		expect(data).toHaveProperty('text');
		expect(data.text).toBeDefined();
		expect(data.text).toBe('The amount of data is too big to be stored in a QR Code');
	});

	// Test for creating a connection credential offer
	test('should create a credential offer to existing connection', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'create-credential-offer-didcomm',
			arguments: {
				attributes: { score: '80' },
				credentialDefinitionId: state.testCredentialDefinitionId,
				connectionId: state.connectionId, // Use the connection ID from the previous test
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('createdAt');
		expect(Date.parse(data.createdAt)).toBeCloseTo(Date.now(), -1000); // Check if createdAt is close to the current time
		expect(data.id).toBeDefined();
		state.credentialExchangeId = data.id; // Save the credential exchange ID for later tests
		expect(data.state).toBeDefined();
		expect(data.state).toBe('offer-sent');
		expect(data.role).toBe('issuer');
		expect(data.connectionId).toBe(state.connectionId);
	});

	// Accept the credential offer at the Holder agent
	test('should accept the credential offer at the Holder agent', async ({ holderAgent }) => {
		const acceptOffer = await holderAgent.acceptAndStoreCredential();
		expect(acceptOffer).toHaveProperty('cred_ex_record');
		expect(acceptOffer.cred_ex_record.state).toBe('done');
		expect(acceptOffer.cred_ex_record.role).toBe('holder');
		expect(acceptOffer).toHaveProperty('anoncreds');
	});

	// Test for listing all credentials
	test('should list all credentials', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-credentials',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
	});

	// Test for retrieving all credential exchange records
	test('should retrieve all credential exchange records', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-credential-exchange-records',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);
	});

	// Test for retrieving a specific credential
	test('should retrieve a specific credential', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'get-credential-record',
			arguments: {
				credentialId: state.credentialExchangeId, // Use the credential ID from the previous test
			},
		});
		const data = parseToolResponse(result);
		expect(data).toHaveProperty('credentials');
		expect(data).toHaveProperty('id');
		expect(data.id).toBe(state.credentialExchangeId);
		expect(data.role).toBe('issuer');
	});

	// TODO Add accept credential exchange record test
});
