import { test, expect } from './setup';
import { state } from './state';
import { waitForConnectionState } from './utils';

test.describe('Connection Operations', () => {
	// Setup for all Connection tests
	test.beforeAll(async () => {
		// No scripts as Connection tests are independent of did or schema
		console.log('Setting up Connection Operations test suite...');
	});

	// Cleanup after all Connection tests
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('Connection Operations test suite completed');
	});
	// Test for creating a DIDComm connection invitation
	test('should create a DIDComm connection invitation', async ({ client, parseFlexibleToolResponse }) => {
		const result = await client.callTool({
			name: 'create-connection-invitation-didcomm',
			arguments: {},
		});

		const data = parseFlexibleToolResponse(result);

		// Validate QR code content
		expect(data).toHaveProperty('image');
		const qrCode = data.image;
		expect(qrCode).toBeDefined();
		expect(qrCode.mimeType).toBe('image/png');
		expect(qrCode.data).toBeDefined();

		// Validate invitation URL
		expect(data).toHaveProperty('connectionUrl');
		expect(data.connectionUrl).toBeDefined();

		// Validate invitation object
		expect(data).toHaveProperty('json');
		expect(data.json).toBeDefined();
		expect(data.json).toHaveProperty('@type');
		expect(data.json).toHaveProperty('services');
	});

	// Test for accepting a DIDComm connection invitation
	test('should accept a DIDComm connection invitation', async ({ client, holderAgent, parseToolResponse }) => {
		// Create an invitation from Holder agent
		// TODO Fix this test after Credo bug for accepting invitation is fixed
		const createInvite = await holderAgent.createInvitation('Faber');
		expect(createInvite).toHaveProperty('state');
		expect(createInvite.state).toBe('initial');
		expect(createInvite).toHaveProperty('invitation_url');
		const result = await client.callTool({
			name: 'accept-connection-invitation-didcomm',
			arguments: {
				invitationUrl: createInvite.invitation_url, // Use the invitation URL from the previous test
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('createdAt');
		state.connectionId = data.id; // Save the connection ID for later tests
		expect(Date.parse(data.createdAt)).toBeCloseTo(Date.now(), -1000); // Check if createdAt is close to the current time
		expect(data.did).toBeDefined();
		expect(data.id).toBeDefined();
		expect(data.outOfBandId).toBeDefined();

		// Wait for the connection to reach the 'completed' state
		const connectionRecord = await waitForConnectionState(client, state.connectionId, 'completed');
		expect(connectionRecord).toBeDefined();
		expect(connectionRecord.state).toBe('completed');
	});

	// Test for listing all DIDComm connections
	test('should list all DIDComm connections', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-connections-didcomm',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);

		// Check if the connection ID from the previous test is present
		expect(data.some((conn: any) => conn.id === state.connectionId)).toBe(true);
		// Validate that the connection ID from the previous test is present
		const connection = data.find((conn: any) => conn.id === state.connectionId);
		expect(connection).toBeDefined();
		expect(connection.state).toBe('completed');
	});

	// Test for retrieving a specific DIDComm connection record
	test('should retrieve a specific DIDComm connection record', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'get-connection-record-didcomm',
			arguments: {
				connectionId: state.connectionId, // Use the connection ID from the previous test
			},
		});

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('id');
		expect(data.id).toBe(state.connectionId);
		expect(data.state).toBe('completed');
	});
});
