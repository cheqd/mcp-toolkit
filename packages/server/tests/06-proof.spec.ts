import { test, expect } from './setup';
import { state } from './state';
import { waitForPresentationState } from './utils';

test.describe('Present Proof Operations', () => {
	// Setup for all Proof tests
	test.beforeAll(async () => {
		// Skip all tests in this suite if prerequisites aren't met
		test.skip(!state.connectionId, 'No active connection available for proof operations');
		test.skip(!state.testCredentialDefinitionId, 'No credential definition available');
		// No other setup needed
	});

	// Cleanup after all Proof tests
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('Present Proof Operations test suite completed');
	});

	// TODO: Update the testcase after fxing the issue with large QR Code
	// Negative Test: creating a connectionless proof request fails
	test('should not create a connectionless proof request', async ({ client, parseFlexibleToolResponse }) => {
		const result = await client.callTool({
			name: 'create-proof-request-connectionless',
			arguments: {
				requestedAttributes: [],
				requestedPredicates: [
					{
						attribute: 'score',
						p_type: '>=',
						p_value: 70,
						restrictions: [
							{
								cred_def_id: state.testCredentialDefinitionId,
							},
						],
					},
				],
			},
		});

		const data = parseFlexibleToolResponse(result);

		// Validate error message
		expect(data).toHaveProperty('text');
		expect(data.text).toBeDefined();
		expect(data.text).toBe('The amount of data is too big to be stored in a QR Code');
	});

	// Test for creating a connection proof request
	test('should create a proof request to existing connection', async ({ client, holderAgent, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'create-proof-request-didcomm',
			arguments: {
				requestedAttributes: [],
				requestedPredicates: [
					{
						attribute: 'score',
						p_type: '>=',
						p_value: 70,
						restrictions: [
							{
								cred_def_id: state.testCredentialDefinitionId,
							},
						],
					},
				],
				connectionId: state.connectionId, // Use the connection ID from the previous test
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('createdAt');
		state.proofRecordId = data.id; // Save the proof record ID for later tests
		expect(Date.parse(data.createdAt)).toBeCloseTo(Date.now(), -1000); // Check if createdAt is close to the current time
		expect(data.state).toBeDefined();
		expect(data.role).toBeDefined();
		expect(data.state).toBe('request-sent');
		expect(data.role).toBe('verifier');
		expect(data.connectionId).toBe(state.connectionId);

		// Accept the credential offer from the Holder agent
		const acceptOffer = await holderAgent.acceptAndSendPresentation();
		expect(acceptOffer).toHaveProperty('state');
		expect(acceptOffer.state).toBe('presentation-sent');
		expect(acceptOffer.role).toBe('prover');
	});

	// Test for listing all proof requests
	test('should list all proofs', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-proofs',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);
	});

	// Test for retrieving a specific proof exchange record
	test('should retrieve a specific proof exchange record', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'get-proof-record',
			arguments: {
				proofRecordId: state.proofRecordId, // Use the credential ID from the previous test
			},
		});
		const data = parseToolResponse(result);
		expect(data).toHaveProperty('id');
		expect(data.id).toBe(state.proofRecordId);
		expect(data.role).toBe('verifier');

		const finalState = await waitForPresentationState(client, state.proofRecordId, 'done');
		expect(finalState).toHaveProperty('state');
		expect(finalState.state).toBe('done');
		expect(finalState.isVerified).toBe(true);
		expect(finalState.role).toBe('verifier');
	});

	// TODO Add Test for accepting a proof request
});
